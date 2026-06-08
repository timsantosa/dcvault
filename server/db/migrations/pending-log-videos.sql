-- Pending log videos (jump/drill) awaiting admin approval. Run against MySQL 5.7 when not using Sequelize sync.
CREATE TABLE IF NOT EXISTS `pendingLogVideos` (
  `id` INTEGER NOT NULL auto_increment ,
  `athleteProfileId` INTEGER NOT NULL,
  `videoUrl` VARCHAR(255) NOT NULL,
  `entityKind` VARCHAR(255) NOT NULL,
  `jumpId` INTEGER NULL,
  `drillId` INTEGER NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`athleteProfileId`) REFERENCES `athleteProfiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`jumpId`) REFERENCES `jumps` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`drillId`) REFERENCES `drills` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX `pending_log_videos_athlete` ON `pendingLogVideos` (`athleteProfileId`);
CREATE INDEX `pending_log_videos_jump` ON `pendingLogVideos` (`jumpId`);
CREATE INDEX `pending_log_videos_drill` ON `pendingLogVideos` (`drillId`);
