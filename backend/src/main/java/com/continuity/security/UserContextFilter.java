package com.continuity.security;

import com.continuity.entity.UserEntity;
import com.continuity.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;
import java.util.Optional;

@Component
public class UserContextFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(UserContextFilter.class);
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final String jwtSecret;
    private final org.springframework.core.env.Environment env;

    public UserContextFilter(
            UserRepository userRepository,
            ObjectMapper objectMapper,
            org.springframework.core.env.Environment env,
            @Value("${JWT_SECRET:${app.jwt.secret:}}") String injectedSecret) {
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.env = env;
        String envSecret = (injectedSecret != null && !injectedSecret.isBlank()) ? injectedSecret : System.getenv("JWT_SECRET");
        if (envSecret == null || envSecret.trim().length() < 32) {
            throw new IllegalStateException("FATAL: JWT_SECRET environment variable is missing or shorter than 32 characters.");
        }
        this.jwtSecret = envSecret.trim();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            UserEntity authenticatedUser = verifyAndExtractUser(token);

            if (authenticatedUser != null) {
                String roleClaim = authenticatedUser.getRole() != null ? authenticatedUser.getRole() : "EMPLOYEE";
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        authenticatedUser,
                        null,
                        List.of(
                                new SimpleGrantedAuthority("ROLE_USER"),
                                new SimpleGrantedAuthority("ROLE_" + roleClaim.toUpperCase().replace(" ", "_"))
                        )
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } else if (env != null && env.matchesProfiles("test")) {
            String testUserId = request.getHeader("X-User-Id");
            if (testUserId != null && !testUserId.isBlank()) {
                Optional<UserEntity> userOpt = userRepository.findById(testUserId.trim());
                if (userOpt.isPresent()) {
                    UserEntity user = userOpt.get();
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            List.of(
                                    new SimpleGrantedAuthority("ROLE_USER"),
                                    new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase().replace(" ", "_"))
                            )
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private UserEntity verifyAndExtractUser(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return null;
            }

            String headerB64 = parts[0];
            String payloadB64 = parts[1];
            String signatureB64 = parts[2];

            // Verify HMAC-SHA256 signature
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(this.jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);

            byte[] expectedSigBytes = mac.doFinal((headerB64 + "." + payloadB64).getBytes(StandardCharsets.US_ASCII));
            byte[] providedSigBytes = Base64.getUrlDecoder().decode(signatureB64);

            if (!MessageDigest.isEqual(expectedSigBytes, providedSigBytes)) {
                log.warn("Invalid JWT signature detected in request to Convergence backend");
                return null;
            }

            // Decode payload claims
            byte[] payloadBytes = Base64.getUrlDecoder().decode(payloadB64);
            JsonNode claims = objectMapper.readTree(payloadBytes);

            // Check expiration
            if (claims.has("exp")) {
                long exp = claims.get("exp").asLong();
                if (System.currentTimeMillis() / 1000 > exp) {
                    log.warn("Expired JWT token presented");
                    return null;
                }
            }

            String userId = claims.has("sub") ? claims.get("sub").asText() : null;
            if (userId == null || userId.isBlank()) {
                return null;
            }

            // Lookup from DB or construct authenticated identity
            Optional<UserEntity> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                return userOpt.get();
            }

            // If not found in Spring DB yet, construct identity from verified claims
            UserEntity transientUser = new UserEntity();
            transientUser.setId(userId);
            transientUser.setName(claims.has("name") ? claims.get("name").asText() : userId);
            transientUser.setEmail(claims.has("email") ? claims.get("email").asText() : userId + "@continuity.internal");
            String sysRole = claims.has("systemRole") ? claims.get("systemRole").asText() : (claims.has("role") ? claims.get("role").asText() : "Employee");
            transientUser.setRole(sysRole);
            transientUser.setInitials(claims.has("name") && !claims.get("name").asText().isEmpty() ? claims.get("name").asText().substring(0, 1).toUpperCase() : "U");
            transientUser.setDepartment(claims.has("department") ? claims.get("department").asText() : "Platform Engineering");

            return transientUser;
        } catch (Exception e) {
            log.error("Failed to parse or verify JWT: {}", e.getMessage());
            return null;
        }
    }
}
