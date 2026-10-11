package com.continuity.security;

import com.continuity.entity.UserEntity;
import com.continuity.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class UserContextFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    public UserContextFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String userIdHeader = request.getHeader("X-User-Id");
        String authHeader = request.getHeader("Authorization");

        String resolvedUserId = null;
        if (userIdHeader != null && !userIdHeader.isBlank()) {
            resolvedUserId = userIdHeader.trim();
        } else if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            // If token is a user ID or mock token
            if (token.startsWith("user-")) {
                resolvedUserId = token;
            }
        }

        if (resolvedUserId != null) {
            Optional<UserEntity> userOpt = userRepository.findById(resolvedUserId);
            if (userOpt.isPresent()) {
                UserEntity user = userOpt.get();
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_USER"), new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase().replace(" ", "_")))
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }
}
