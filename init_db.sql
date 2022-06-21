CREATE DATABASE  IF NOT EXISTS `lvtn` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `lvtn`;
-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: localhost    Database: lvtn
-- ------------------------------------------------------
-- Server version	8.0.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `account_ID` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `password` varchar(255) NOT NULL,
  `bc_address` varchar(255) NOT NULL,
  `private_key` varchar(255) NOT NULL,
  `public_key` varchar(255) NOT NULL,
  `role` varchar(10) NOT NULL,
  PRIMARY KEY (`account_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `data_owner`
--

DROP TABLE IF EXISTS `data_owner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_owner` (
  `do_id` int NOT NULL,
  PRIMARY KEY (`do_id`),
  CONSTRAINT `DO_Id` FOREIGN KEY (`do_id`) REFERENCES `account` (`account_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `data_packet`
--

DROP TABLE IF EXISTS `data_packet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_packet` (
  `data_id` varchar(45) NOT NULL,
  `device_id_mk` varchar(45) NOT NULL,
  `private_key` varchar(255) NOT NULL,
  `public_key` varchar(255) NOT NULL,
  `start_day` bigint NOT NULL,
  `end_day` bigint NOT NULL,
  `data_uri` varchar(255) NOT NULL,
  `rek_uri` varchar(255) NOT NULL,
  PRIMARY KEY (`data_id`),
  KEY `deviceId_idx` (`device_id_mk`),
  CONSTRAINT `deviceID` FOREIGN KEY (`device_id_mk`) REFERENCES `device` (`device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `data_user`
--

DROP TABLE IF EXISTS `data_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_user` (
  `du_id` int NOT NULL,
  PRIMARY KEY (`du_id`),
  CONSTRAINT `Du_ID` FOREIGN KEY (`du_id`) REFERENCES `account` (`account_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `device`
--

DROP TABLE IF EXISTS `device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device` (
  `device_id` varchar(45) NOT NULL,
  `dataOwner_id_mk` int NOT NULL,
  `price` int NOT NULL,
  `description` varchar(255) NOT NULL,
  `data_period` int DEFAULT NULL,
  PRIMARY KEY (`device_id`),
  KEY `do_id_idx` (`dataOwner_id_mk`),
  CONSTRAINT `dataOwner_ID` FOREIGN KEY (`dataOwner_id_mk`) REFERENCES `data_owner` (`do_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `receive`
--

DROP TABLE IF EXISTS `receive`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receive` (
  `dataUser_id_fk` int NOT NULL,
  `data_id_fk` varchar(45) NOT NULL,
  `re_key` varchar(255) NOT NULL,
  `confirm` tinyint(1) DEFAULT NULL,
  `device_id_mk` varchar(255) NOT NULL,
  PRIMARY KEY (`dataUser_id_fk`,`data_id_fk`),
  CONSTRAINT `dataUser_ID` FOREIGN KEY (`dataUser_id_fk`) REFERENCES `data_user` (`du_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `register`
--

DROP TABLE IF EXISTS `register`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `register` (
  `du_id_fk` int NOT NULL,
  `device_id_fk` varchar(45) NOT NULL,
  `start_day` bigint NOT NULL,
  `end_day` bigint NOT NULL,
  `trans_id` varchar(255) NOT NULL,
  `is_updated` tinyint(1) unsigned zerofill NOT NULL,
  `subscribe_time` bigint DEFAULT NULL,
  PRIMARY KEY (`device_id_fk`,`start_day`,`du_id_fk`,`end_day`),
  KEY `dataUserID_idx` (`du_id_fk`),
  CONSTRAINT `dataUserID` FOREIGN KEY (`du_id_fk`) REFERENCES `data_user` (`du_id`),
  CONSTRAINT `device_ID` FOREIGN KEY (`device_id_fk`) REFERENCES `device` (`device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-06-21 15:08:03
