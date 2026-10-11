package com.continuity.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.io.File;

@Configuration
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    private String snapshotDir = "./storage/snapshots";

    public String getSnapshotDir() {
        return snapshotDir;
    }

    public void setSnapshotDir(String snapshotDir) {
        this.snapshotDir = snapshotDir;
    }

    public File getSnapshotDirFile() {
        File dir = new File(snapshotDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return dir;
    }
}
