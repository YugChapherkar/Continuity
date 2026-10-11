package com.continuity.service;

import com.continuity.config.StorageProperties;
import com.continuity.dto.ChangedFileDto;
import com.continuity.entity.VersionFileEntity;
import com.continuity.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class StorageService {

    private final StorageProperties storageProperties;

    private static final long MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50MB
    private static final int MAX_FILE_COUNT = 2000;
    private static final Set<String> IGNORED_EXTENSIONS = Set.of(
            ".exe", ".dll", ".so", ".dylib", ".class", ".pyc", ".o", ".bin", ".iso", ".tar", ".gz"
    );
    private static final Set<String> IGNORED_DIRECTORIES = Set.of(
            ".git", "node_modules", "target", "build", "dist", ".idea", ".vscode"
    );

    public StorageService(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
    }

    public File saveSnapshotArchive(String projectId, String versionId, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }
        if (file.getSize() > MAX_ZIP_SIZE) {
            throw new BadRequestException("ZIP file exceeds maximum limit of 50MB");
        }

        File projectDir = new File(storageProperties.getSnapshotDirFile(), projectId);
        if (!projectDir.exists()) {
            projectDir.mkdirs();
        }

        File targetFile = new File(projectDir, versionId + ".zip");
        file.transferTo(targetFile.toPath());
        return targetFile;
    }

    public static class ExtractionResult {
        public List<VersionFileEntity> fileEntities = new ArrayList<>();
        public Map<String, String> fileContents = new LinkedHashMap<>();
        public int totalFiles = 0;
    }

    public ExtractionResult extractAndInspectArchive(File zipFile, String projectId, String versionId) throws IOException {
        ExtractionResult result = new ExtractionResult();
        Path destDir = Files.createTempDirectory("continuity-extract-" + projectId + "-" + versionId);

        try (ZipInputStream zis = new ZipInputStream(new BufferedInputStream(new FileInputStream(zipFile)))) {
            ZipEntry entry;
            int fileCount = 0;

            while ((entry = zis.getNextEntry()) != null) {
                fileCount++;
                if (fileCount > MAX_FILE_COUNT) {
                    throw new BadRequestException("ZIP archive contains too many files (max: " + MAX_FILE_COUNT + ")");
                }

                String entryName = entry.getName();
                // Prevent Zip Slip vulnerability
                Path targetPath = destDir.resolve(entryName).normalize();
                if (!targetPath.startsWith(destDir)) {
                    throw new BadRequestException("Security alert: Zip entry attempts directory traversal: " + entryName);
                }

                if (entry.isDirectory()) {
                    Files.createDirectories(targetPath);
                    continue;
                }

                // Filter out dangerous or unwanted files
                if (isIgnoredPath(entryName)) {
                    continue;
                }

                Files.createDirectories(targetPath.getParent());
                byte[] content = zis.readAllBytes();
                Files.write(targetPath, content);

                String fileType = determineFileType(entryName);
                String snippet = "";
                if (isTextFile(entryName)) {
                    String fullText = new String(content, StandardCharsets.UTF_8);
                    snippet = fullText.length() > 500 ? fullText.substring(0, 500) + "..." : fullText;
                    result.fileContents.put(entryName, fullText);
                }

                VersionFileEntity fileEntity = new VersionFileEntity();
                fileEntity.setId(UUID.randomUUID().toString());
                fileEntity.setProjectId(projectId);
                fileEntity.setVersionId(versionId);
                fileEntity.setName(new File(entryName).getName());
                fileEntity.setPath(entryName);
                fileEntity.setSizeBytes((long) content.length);
                fileEntity.setFileType(fileType);
                fileEntity.setContentSnippet(snippet);
                fileEntity.setFileHash(calculateSha256(content));

                result.fileEntities.add(fileEntity);
            }
            result.totalFiles = result.fileEntities.size();
        } finally {
            // Clean up temporary extracted folder
            deleteDirectoryRecursively(destDir.toFile());
        }

        return result;
    }

    public List<ChangedFileDto> computeFileDifferences(List<VersionFileEntity> currentFiles, List<VersionFileEntity> parentFiles) {
        List<ChangedFileDto> diffs = new ArrayList<>();
        Map<String, VersionFileEntity> parentMap = new HashMap<>();
        if (parentFiles != null) {
            for (VersionFileEntity pf : parentFiles) {
                parentMap.put(pf.getPath(), pf);
            }
        }

        for (VersionFileEntity cf : currentFiles) {
            VersionFileEntity pf = parentMap.remove(cf.getPath());
            if (pf == null) {
                // Added file
                diffs.add(new ChangedFileDto(cf.getPath(), Math.max(1, (int) (cf.getSizeBytes() / 50)), 0));
            } else if (!Objects.equals(cf.getFileHash(), pf.getFileHash())) {
                // Modified file
                diffs.add(new ChangedFileDto(cf.getPath(), Math.max(1, (int) (cf.getSizeBytes() / 100)), Math.max(1, (int) (pf.getSizeBytes() / 120))));
            }
        }

        // Remaining in parentMap are deleted files
        for (VersionFileEntity deleted : parentMap.values()) {
            diffs.add(new ChangedFileDto(deleted.getPath(), 0, Math.max(1, (int) (deleted.getSizeBytes() / 50))));
        }

        return diffs;
    }

    private boolean isIgnoredPath(String path) {
        String lower = path.toLowerCase();
        if (lower.contains(".env") || lower.contains("id_rsa") || lower.contains(".pem") || lower.contains("credentials")) {
            return true;
        }
        for (String dir : IGNORED_DIRECTORIES) {
            if (lower.startsWith(dir + "/") || lower.contains("/" + dir + "/")) {
                return true;
            }
        }
        for (String ext : IGNORED_EXTENSIONS) {
            if (lower.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }

    private boolean isTextFile(String path) {
        String lower = path.toLowerCase();
        return lower.endsWith(".rs") || lower.endsWith(".go") || lower.endsWith(".java") || lower.endsWith(".py")
                || lower.endsWith(".ts") || lower.endsWith(".tsx") || lower.endsWith(".js") || lower.endsWith(".json")
                || lower.endsWith(".yaml") || lower.endsWith(".yml") || lower.endsWith(".md") || lower.endsWith(".txt")
                || lower.endsWith(".toml") || lower.endsWith(".proto") || lower.endsWith(".sql") || lower.endsWith(".sh");
    }

    private String determineFileType(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".json") || lower.endsWith(".yaml") || lower.endsWith(".yml") || lower.endsWith(".toml")) {
            return "config";
        }
        if (lower.endsWith(".md") || lower.endsWith(".txt") || lower.endsWith(".adoc")) {
            return "doc";
        }
        if (lower.endsWith(".proto") || lower.endsWith(".sql") || lower.endsWith(".graphql")) {
            return "schema";
        }
        return "code";
    }

    public static String calculateSha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }

    private void deleteDirectoryRecursively(File file) {
        if (file.isDirectory()) {
            File[] files = file.listFiles();
            if (files != null) {
                for (File f : files) {
                    deleteDirectoryRecursively(f);
                }
            }
        }
        file.delete();
    }
}
