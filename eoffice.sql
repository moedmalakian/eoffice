-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 05, 2023 at 02:44 PM
-- Server version: 10.4.19-MariaDB
-- PHP Version: 8.0.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eoffice`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `att_id` int(30) NOT NULL,
  `use_id` int(30) NOT NULL,
  `div_id` int(30) NOT NULL,
  `pos_id` int(30) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `attendance` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `remarks` varchar(255) NOT NULL,
  `qty` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `division`
--

CREATE TABLE `division` (
  `div_id` int(30) NOT NULL,
  `division_code` varchar(30) NOT NULL,
  `division_name` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `division`
--

INSERT INTO `division` (`div_id`, `division_code`, `division_name`, `created_date`, `created_by`) VALUES
(1, 'PRO', 'PRODUCT', '2023-09-01 00:00:00', 'SYSTEM'),
(2, 'FIN', 'FINANCE', '2023-09-01 00:00:00', 'SYSTEM'),
(3, 'HRD', 'HUMAN RESOURCE', '2023-09-01 00:00:00', 'SYSTEM');

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `emp_id` int(30) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `gender` varchar(30) NOT NULL,
  `birthday` date NOT NULL,
  `family` varchar(30) NOT NULL,
  `div_id` int(30) NOT NULL,
  `pos_id` int(30) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `status` varchar(30) NOT NULL,
  `created_date` datetime NOT NULL,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`emp_id`, `fullname`, `gender`, `birthday`, `family`, `div_id`, `pos_id`, `phone`, `email`, `address`, `status`, `created_date`, `created_by`) VALUES
(1012, 'JOHN DOE', 'MALE', '1991-08-01', 'SINGLE', 1, 2, '089765432111', 'johndoe@mail.com', 'JAKARTA', 'Y', '2023-09-02 06:17:12', 'SYSTEM'),
(1013, 'JANE DOE', 'FEMALE', '1991-08-01', 'SINGLE', 1, 1, '089765432111', 'janedoe@mail.com', 'JAKARTA', 'Y', '2023-09-01 05:15:00', 'SYSTEM');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `eve_id` int(30) NOT NULL,
  `event_code` varchar(30) NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `message` varchar(255) NOT NULL,
  `remarks` varchar(255) NOT NULL,
  `qty` varchar(255) NOT NULL,
  `approval_date` datetime NOT NULL,
  `approval_by` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `object`
--

CREATE TABLE `object` (
  `obj_id` int(30) NOT NULL,
  `object_name` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `outgoing_work`
--

CREATE TABLE `outgoing_work` (
  `out_id` int(30) NOT NULL,
  `emp_id` int(30) NOT NULL,
  `pos_id` int(30) NOT NULL,
  `div_id` int(30) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `project` varchar(255) NOT NULL,
  `agenda` varchar(255) NOT NULL,
  `remarks` varchar(255) NOT NULL,
  `qty` varchar(255) NOT NULL,
  `nominal_1` varchar(255) NOT NULL,
  `nominal_2` varchar(255) NOT NULL,
  `nominal_3` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL,
  `approval_date` datetime NOT NULL,
  `approval_by` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `overtime`
--

CREATE TABLE `overtime` (
  `ove_id` int(30) NOT NULL,
  `emp_id` int(30) NOT NULL,
  `pos_id` int(30) NOT NULL,
  `div_id` int(30) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `project` varchar(255) NOT NULL,
  `remarks` varchar(255) NOT NULL,
  `qty` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL,
  `approval_date` datetime NOT NULL,
  `approval_by` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `pay_id` int(30) NOT NULL,
  `emp_id` int(30) NOT NULL,
  `pos_id` int(30) NOT NULL,
  `div_id` int(30) NOT NULL,
  `salary` varchar(255) NOT NULL,
  `onl_id` int(30) NOT NULL,
  `ove_id` int(30) NOT NULL,
  `out_id` int(30) NOT NULL,
  `nominal_1` varchar(255) NOT NULL,
  `nominal_2` varchar(255) NOT NULL,
  `nominal_3` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL,
  `remarks` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `position`
--

CREATE TABLE `position` (
  `pos_id` int(30) NOT NULL,
  `position_code` varchar(30) NOT NULL,
  `position_name` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `position`
--

INSERT INTO `position` (`pos_id`, `position_code`, `position_name`, `created_date`, `created_by`) VALUES
(1, 'DEV', 'DEVELOPER', '2023-09-01 00:00:00', 'SYSTEM'),
(2, 'QUA', 'QUALITY ASSURANCE', '2023-09-01 00:00:00', 'SYSTEM');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `rol_id` int(30) NOT NULL,
  `use_id` int(30) NOT NULL,
  `obj_id` int(30) NOT NULL,
  `role_name` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `role_object`
--

CREATE TABLE `role_object` (
  `rob_id` int(30) NOT NULL,
  `obj_id` int(30) NOT NULL,
  `role_name` varchar(255) NOT NULL,
  `object_name` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `use_id` int(30) NOT NULL,
  `emp_id` int(30) NOT NULL,
  `rol_id` int(30) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `division`
--
ALTER TABLE `division`
  ADD PRIMARY KEY (`div_id`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`emp_id`);

--
-- Indexes for table `position`
--
ALTER TABLE `position`
  ADD PRIMARY KEY (`pos_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `division`
--
ALTER TABLE `division`
  MODIFY `div_id` int(30) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `emp_id` int(30) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1014;

--
-- AUTO_INCREMENT for table `position`
--
ALTER TABLE `position`
  MODIFY `pos_id` int(30) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;