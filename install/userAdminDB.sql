-- MySQL dump 10.13  Distrib 5.5.32, for linux2.6 (x86_64)
--
-- Host: localhost    Database: iostp
-- ------------------------------------------------------
-- Server version	5.5.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES UTF8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `uc_configuration`
--

DROP TABLE IF EXISTS `uc_configuration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `uc_configuration` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `value` varchar(150) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uc_configuration`
--

LOCK TABLES `uc_configuration` WRITE;
/*!40000 ALTER TABLE `uc_configuration` DISABLE KEYS */;
INSERT INTO `uc_configuration` VALUES (1,'website_name','IOSTP Portal'),(2,'website_url','IOSTP.org/'),(3,'email','noreply@IOSTP.org'),(4,'activation','true'),(5,'resend_activation_threshold','0'),(6,'language','/userAdmin/models/languages/en.php'),(7,'template','models/site-templates/default.css');
/*!40000 ALTER TABLE `uc_configuration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uc_pages`
--

DROP TABLE IF EXISTS `uc_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `uc_pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page` varchar(150) NOT NULL,
  `private` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uc_pages`
--

LOCK TABLES `uc_pages` WRITE;
/*!40000 ALTER TABLE `uc_pages` DISABLE KEYS */;
INSERT INTO `uc_pages` VALUES (1,'account.php',1),(2,'activate-account.php',0),(3,'admin_configuration.php',1),(4,'admin_page.php',1),(5,'admin_pages.php',1),(6,'admin_permission.php',1),(7,'admin_permissions.php',1),(8,'admin_user.php',1),(9,'admin_users.php',1),(10,'forgot-password.php',0),(11,'index.php',0),(12,'left-nav.php',0),(13,'login.php',0),(14,'logout.php',1),(15,'register.php',1),(16,'resend-activation.php',0),(17,'user_settings.php',1);
/*!40000 ALTER TABLE `uc_pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uc_permission_page_matches`
--

DROP TABLE IF EXISTS `uc_permission_page_matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `uc_permission_page_matches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `permission_id` int(11) NOT NULL,
  `page_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uc_permission_page_matches`
--

LOCK TABLES `uc_permission_page_matches` WRITE;
/*!40000 ALTER TABLE `uc_permission_page_matches` DISABLE KEYS */;
INSERT INTO `uc_permission_page_matches` VALUES (2,1,14),(4,2,1),(5,2,3),(6,2,4),(7,2,5),(8,2,6),(9,2,7),(10,2,8),(11,2,9),(12,2,14),(13,2,17),(14,2,15),(15,3,15),(16,4,15);
/*!40000 ALTER TABLE `uc_permission_page_matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uc_permissions`
--

DROP TABLE IF EXISTS `uc_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `uc_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uc_permissions`
--

LOCK TABLES `uc_permissions` WRITE;
/*!40000 ALTER TABLE `uc_permissions` DISABLE KEYS */;
INSERT INTO `uc_permissions` VALUES (1,'Student'),(2,'Administrator'),(3,'Superuser'),(4,'Teacher');
/*!40000 ALTER TABLE `uc_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uc_user_permission_matches`
--

DROP TABLE IF EXISTS `uc_user_permission_matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `uc_user_permission_matches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uc_user_permission_matches`
--

LOCK TABLES `uc_user_permission_matches` WRITE;
/*!40000 ALTER TABLE `uc_user_permission_matches` DISABLE KEYS */;
INSERT INTO `uc_user_permission_matches` VALUES (1,1,2),(2,1,1),(3,1,3),(4,1,4);
/*!40000 ALTER TABLE `uc_user_permission_matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uc_users`
--

DROP TABLE IF EXISTS `uc_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `uc_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(50) NOT NULL,
  `display_name` varchar(50) NOT NULL,
  `password` varchar(225) NOT NULL,
  `email` varchar(150) NOT NULL,
  `activation_token` varchar(225) NOT NULL,
  `last_activation_request` int(11) NOT NULL,
  `lost_password_request` tinyint(1) NOT NULL,
  `active` tinyint(1) NOT NULL,
  `title` varchar(150) NOT NULL,
  `sign_up_stamp` int(11) NOT NULL,
  `last_sign_in_stamp` int(11) NOT NULL,
  `kit_data` blob,
  `last_kit_save_stamp` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uc_users`
--

LOCK TABLES `uc_users` WRITE;
/*!40000 ALTER TABLE `uc_users` DISABLE KEYS */;
INSERT INTO `uc_users` VALUES (1,'admin','admin','f0873108034a34cdf4ef81ccc5b685d188f14672e3b9f8062b58c26eb379cd47d','light@alum.mit.edu','17ea7d204cfb20623ad0c5cb79d1c4b8',1382035419,0,1,'Grand Poobah',1382035419,1382548712,'[{\"type\":\"Xively Data Viewer\",\"name\":\"My 1st Observation Kit\",\"configData\":\"{\\\"datastreams\\\":[{\\\"index\\\":0,\\\"datastream\\\":\\\"61916!random3600\\\"},{\\\"index\\\":0,\\\"name\\\":\\\"sin()\\\",\\\"datastream\\\":\\\"61916!sine3600\\\"},{\\\"index\\\":1,\\\"datastream\\\":\\\"2045025466!temp\\\"}],\\\"start\\\":\\\"2013-10-23T11:18:00.000Z\\\",\\\"end\\\":\\\"2013-10-23T17:18:00.000Z\\\"}\"}]',1382548714);
/*!40000 ALTER TABLE `uc_users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-10-23 13:23:08
