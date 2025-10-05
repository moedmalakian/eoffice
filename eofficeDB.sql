-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Sep 23, 2025 at 02:08 PM
-- Server version: 8.0.41
-- PHP Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eofficeDB`
--

-- --------------------------------------------------------

--
-- Table structure for table `approval`
--

CREATE TABLE `approval` (
  `apr_id` int NOT NULL,
  `module_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ref_id` int NOT NULL,
  `step_order` int NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `approval_config`
--

CREATE TABLE `approval_config` (
  `apc_id` int NOT NULL,
  `module_name` varchar(255) NOT NULL,
  `step_order` int NOT NULL,
  `assignment_type` varchar(255) NOT NULL,
  `emp_id` int DEFAULT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `att_id` int NOT NULL,
  `emp_id` int NOT NULL,
  `use_id` int NOT NULL,
  `div_id` int NOT NULL,
  `pos_id` int NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `attendance` varchar(255) DEFAULT NULL,
  `att_type` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `remarks` text,
  `activity` text,
  `qty` varchar(255) DEFAULT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`att_id`, `emp_id`, `use_id`, `div_id`, `pos_id`, `start_date`, `end_date`, `attendance`, `att_type`, `location`, `latitude`, `longitude`, `remarks`, `activity`, `qty`, `created_date`, `created_by`) VALUES
(22, 1016, 11, 1, 2, '2025-07-01 11:47:29', '2025-07-01 15:11:31', 'Hadir', 'WFO', 'Graha Kirana, 88, Jalan Mitra Sunter Boulevard, Sunter Jaya, Tanjung Priok, North Jakarta, Special capital Region of Jakarta, Java, 14350, Indonesia', -6.150396, 106.888135, '', '', '3', '2025-09-09 11:47:29', 'eoffice'),
(23, 1016, 11, 1, 2, '2025-08-07 11:47:40', '2025-08-07 15:11:26', 'Hadir', 'WFO', 'Graha Kirana, 88, Jalan Mitra Sunter Boulevard, Sunter Jaya, Tanjung Priok, North Jakarta, Special capital Region of Jakarta, Java, 14350, Indonesia', -6.150396, 106.888135, '', '', '3', '2025-09-09 11:47:40', 'eoffice'),
(26, 1016, 11, 1, 2, '2025-09-09 08:10:40', '2025-09-09 22:13:21', 'Hadir', 'WFO', 'Jalan Sungai Indragiri I, RW 01, Semper Barat, Cilincing, North Jakarta, Special capital Region of Jakarta, Java, 14130, Indonesia', -6.128632, 106.921307, '', NULL, '14', '2025-09-09 22:10:40', 'eoffice');

-- --------------------------------------------------------

--
-- Table structure for table `division`
--

CREATE TABLE `division` (
  `div_id` int NOT NULL,
  `division_code` varchar(30) NOT NULL,
  `division_name` varchar(255) NOT NULL,
  `emp_id_1` int DEFAULT NULL,
  `emp_id_2` int DEFAULT NULL,
  `emp_id_3` int DEFAULT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `division`
--

INSERT INTO `division` (`div_id`, `division_code`, `division_name`, `emp_id_1`, `emp_id_2`, `emp_id_3`, `created_date`, `created_by`) VALUES
(1, 'DIV001', 'IT', NULL, NULL, NULL, '2025-04-08 07:25:34', 'admin'),
(2, 'DIV002', 'Human Resource', NULL, NULL, NULL, '2025-04-08 07:25:34', 'admin'),
(3, 'DIV003', 'Finance', NULL, NULL, NULL, '2025-04-08 07:25:34', 'admin'),
(4, 'DIV004', 'Marketing', NULL, NULL, NULL, '2025-04-08 07:25:34', 'admin'),
(5, 'DIV005', 'Sales', NULL, NULL, NULL, '2025-04-08 07:25:34', 'admin'),
(6, 'DIV006', 'Legal', NULL, NULL, NULL, '2025-04-08 07:25:34', 'admin'),
(7, 'DIV007', 'Operations', NULL, NULL, NULL, '2025-04-08 07:25:34', 'admin'),
(8, 'DIV008', 'Support', NULL, NULL, NULL, '2025-04-08 07:25:34', 'admin'),
(9, 'DIV009', 'R&D', NULL, NULL, NULL, '2025-04-08 07:25:34', 'admin'),
(10, 'DIV010', 'Customer Care', NULL, NULL, NULL, '2025-04-22 18:51:30', 'eoffice'),
(39, 'dklwlefexde', 'wldk', NULL, NULL, NULL, '2025-08-29 16:12:26', 'eoffice');

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `emp_id` int NOT NULL,
  `employee_code` varchar(255) DEFAULT NULL,
  `fullname` varchar(255) NOT NULL,
  `gender` varchar(30) NOT NULL,
  `birthday` date NOT NULL,
  `family` varchar(30) NOT NULL,
  `div_id` int NOT NULL,
  `pos_id` int NOT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `status` varchar(30) NOT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`emp_id`, `employee_code`, `fullname`, `gender`, `birthday`, `family`, `div_id`, `pos_id`, `phone`, `email`, `address`, `status`, `created_date`, `created_by`) VALUES
(1, NULL, 'John Doe', 'Male', '1990-05-15', 'Single', 1, 1, '081234567890', 'john.doe@example.com', 'Jl. Raya No. 10, Jakarta', 'Y', '2025-04-08 07:36:38', 'admin'),
(2, NULL, 'Jane Smith', 'Female', '1985-07-22', 'Married', 2, 2, '082345678901', 'jane.smith@example.com', 'Jl. Merdeka No. 20, Bandung', 'Y', '2025-04-08 07:36:38', 'admin'),
(3, NULL, 'Robert Brown', 'Male', '1980-02-10', 'Single', 3, 3, '083456789012', 'robert.brown@example.com', 'Jl. Pahlawan No. 5, Surabaya', 'Y', '2025-04-12 00:59:05', 'eoffice'),
(4, NULL, 'Alice Johnson', 'Female', '1992-08-30', 'Single', 1, 1, '081234567891', 'alice.johnson@example.com', 'Jl. Sudirman No. 15, Jakarta', 'Y', '2025-04-08 07:36:38', 'admin'),
(5, NULL, 'Michael White', 'Male', '1987-11-05', 'Married', 2, 2, '082345678902', 'michael.white@example.com', 'Jl. Kebon Jeruk No. 25, Bandung', 'Y', '2025-04-08 07:36:38', 'admin'),
(6, NULL, 'Emily Green', 'Female', '1995-04-14', 'Single', 3, 3, '083456789013', 'emily.green@example.com', 'Jl. Semangka No. 8, Surabaya', 'Y', '2025-04-08 07:36:38', 'admin'),
(8, NULL, 'Sophia Wilson', 'Female', '1991-09-25', 'Single', 3, 3, '082345678903', 'sophia.wilson@example.com', 'Jl. Anggrek No. 7, Bandung', 'Y', '2025-04-08 07:36:38', 'admin'),
(1015, NULL, 'Dewi Wandhani', 'Female', '2025-04-11', 'Married', 4, 4, '09876543211', 'test@mail.com', 'Jl. Mahakam II, Jakarta', 'Y', '2025-04-11 18:07:29', 'eoffice'),
(1016, NULL, 'Eoffice', 'Male', '1994-08-18', 'Married', 1, 2, '089765432111', 'eoffice@mail.com', 'Jl. Sungai Mahakam II, Jakarta', 'Y', '2025-04-12 00:58:17', 'eoffice');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `eve_id` int NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `object`
--

CREATE TABLE `object` (
  `obj_id` int NOT NULL,
  `object_name` varchar(100) NOT NULL,
  `object_code` varchar(255) DEFAULT NULL,
  `access_name` varchar(255) NOT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `folder_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `slug` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `component_name` varchar(255) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `is_menu` varchar(255) NOT NULL,
  `parent_obj_id` int DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `order` int DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `object`
--

INSERT INTO `object` (`obj_id`, `object_name`, `object_code`, `access_name`, `link_url`, `folder_path`, `slug`, `component_name`, `icon`, `is_menu`, `parent_obj_id`, `status`, `order`, `created_date`, `created_by`) VALUES
(48, 'Employee', NULL, 'View', '/master-data/employee', '../views/master-data/employee', 'EmployeeList', 'EmployeeList', 'cilUser', 'Y', 54, 'Y', 1, '2025-08-19 22:44:56', 'eoffice'),
(49, 'Employee', NULL, 'Create', '/master-data/employee/create', '../views/master-data/employee', 'EmployeeCreate', 'EmployeeCreate', NULL, 'N', 48, 'Y', 1, '2025-08-19 21:21:59', 'eoffice'),
(50, 'Employee', NULL, 'Edit', '/master-data/employee/edit/:empId', '../views/master-data/employee', 'EmployeeEdit', 'EmployeeEdit', NULL, 'N', 48, 'Y', 2, '2025-08-19 21:23:19', 'eoffice'),
(51, 'Employee', NULL, 'Detail', '/master-data/employee/detail/:empId', '../views/master-data/employee', 'EmployeeDetail', 'EmployeeDetail', NULL, 'N', 48, 'Y', 3, '2025-08-19 21:23:19', 'eoffice'),
(52, 'User', NULL, 'View', '/master-data/user', '../views/master-data/user', 'UserList', 'UserList', 'cilPeople', 'Y', 54, 'Y', 4, '2025-08-19 22:39:40', 'eoffice'),
(53, 'Role', NULL, 'View', '/master-data/role', '../views/master-data/role', 'RoleList', 'RoleList', 'cilTask', 'Y', 54, 'Y', 5, '2025-09-07 14:36:18', 'eoffice'),
(54, 'Master Data', NULL, 'All', '#', '../views/master-data', '', '', 'cilLibrary', 'Y', NULL, 'Y', 4, '2025-09-07 14:35:35', 'eoffice'),
(57, 'Object', NULL, 'View', '/master-data/object', '../views/master-data/object', 'ObjectList', 'ObjectList', 'cilClipboard', 'Y', 54, 'Y', 6, '2025-09-02 21:39:38', 'eoffice'),
(59, 'Dashboard', NULL, 'Dashboard', '/dashboard', '../views/dashboard', 'Dashboard', 'Dashboard', 'cilChartPie', 'Y', NULL, 'Y', 1, '2025-09-19 17:13:12', 'eoffice'),
(60, 'Employee', NULL, 'Delete', '/master-data/employee/delete/:empId', '../views/master-data/employee', 'EmployeeDelete', 'EmployeeDelete', NULL, 'N', 48, 'Y', 4, '2025-08-19 21:23:19', 'eoffice'),
(61, 'Object', NULL, 'Create', '/master-data/object/create', '../views/master-data/object', 'ObjectCreate', 'ObjectCreate', NULL, 'N', 57, 'Y', 1, '2025-08-23 16:39:48', 'eoffice'),
(62, 'Object', NULL, 'Edit', '/master-data/object/edit/:objId', '../views/master-data/object', 'ObjectEdit', 'ObjectEdit', NULL, 'N', 57, 'Y', 2, '2025-08-23 16:41:27', 'eoffice'),
(63, 'Object', NULL, 'Detail', '/master-data/object/detail/:objId', '../views/master-data/object', 'ObjectDetail', 'ObjectDetail', NULL, 'N', 57, 'Y', 3, '2025-08-23 16:42:28', 'eoffice'),
(64, 'Object', NULL, 'Delete', '/master-data/object/delete/:objId', '../views/master-data/object', 'ObjectDelete', 'ObjectDelete', NULL, 'N', 57, 'Y', 4, '2025-08-23 16:44:46', 'eoffice'),
(65, 'Position', NULL, 'View', '/master-data/position', '../views/master-data/position', 'PositionList', 'PositionList', 'cilBriefcase', 'Y', 54, 'Y', 3, '2025-08-23 21:29:29', 'eoffice'),
(66, 'Division', NULL, 'View', '/master-data/division', '../views/master-data/division', 'DivisionList', 'DivisionList', 'cilBookmark', 'Y', 54, 'Y', 2, '2025-08-23 21:33:23', 'eoffice'),
(67, 'Position', NULL, 'Create', '/master-data/position/create', '../views/master-data/position', 'PositionCreate', 'PositionCreate', NULL, 'N', 65, 'Y', 1, '2025-08-19 21:21:59', 'eoffice'),
(68, 'Position', NULL, 'Edit', '/master-data/position/edit/:posId', '../views/master-data/position', 'PositionEdit', 'PositionEdit', NULL, 'N', 65, 'Y', 2, '2025-08-19 21:23:19', 'eoffice'),
(69, 'Position', NULL, 'Detail', '/master-data/position/detail/:posId', '../views/master-data/position', 'PositionDetail', 'PositionDetail', NULL, 'N', 65, 'Y', 3, '2025-08-19 21:23:19', 'eoffice'),
(70, 'Position', NULL, 'Delete', '/master-data/position/delete/:posId', '../views/master-data/position', 'PositionDelete', 'PositionDelete', NULL, 'N', 65, 'Y', 4, '2025-08-19 21:23:19', 'eoffice'),
(71, 'Division', NULL, 'Create', '/master-data/division/create', '../views/master-data/division', 'DivisionCreate', 'DivisionCreate', NULL, 'N', 66, 'Y', 1, '2025-08-19 21:21:59', 'eoffice'),
(72, 'Division', NULL, 'Edit', '/master-data/division/edit/:divId', '../views/master-data/division', 'DivisionEdit', 'DivisionEdit', NULL, 'N', 66, 'Y', 2, '2025-08-19 21:23:19', 'eoffice'),
(73, 'Division', NULL, 'Detail', '/master-data/division/detail/:divId', '../views/master-data/division', 'DivisionDetail', 'DivisionDetail', NULL, 'N', 66, 'Y', 3, '2025-08-19 21:23:19', 'eoffice'),
(74, 'Division', NULL, 'Delete', '/master-data/division/delete/:divId', '../views/master-data/division', 'DivisionDelete', 'DivisionDelete', NULL, 'N', 66, 'Y', 4, '2025-08-19 21:23:19', 'eoffice'),
(75, 'Role', NULL, 'Create', '/master-data/role/create', '../views/master-data/role', 'RoleCreate', 'RoleCreate', NULL, 'N', 53, 'Y', 1, '2025-08-19 21:21:59', 'eoffice'),
(76, 'Role', NULL, 'Edit', '/master-data/role/edit/:rolId', '../views/master-data/role', 'RoleEdit', 'RoleEdit', NULL, 'N', 53, 'Y', 2, '2025-08-19 21:23:19', 'eoffice'),
(77, 'Role', NULL, 'Detail', '/master-data/role/detail/:rolId', '../views/master-data/role', 'RoleDetail', 'RoleDetail', NULL, 'N', 53, 'Y', 3, '2025-08-19 21:23:19', 'eoffice'),
(78, 'Role', NULL, 'Delete', '/master-data/role/delete/:rolId', '../views/master-data/role', 'RoleDelete', 'RoleDelete', NULL, 'N', 53, 'Y', 4, '2025-08-19 21:23:19', 'eoffice'),
(79, 'User', NULL, 'Create', '/master-data/user/create', '../views/master-data/user', 'UserCreate', 'UserCreate', NULL, 'N', 52, 'Y', 1, '2025-08-19 21:21:59', 'eoffice'),
(80, 'User', NULL, 'Edit', '/master-data/user/edit/:useId', '../views/master-data/user', 'UserEdit', 'UserEdit', NULL, 'N', 52, 'Y', 2, '2025-08-19 21:23:19', 'eoffice'),
(81, 'User', NULL, 'Detail', '/master-data/user/detail/:useId', '../views/master-data/user', 'UserDetail', 'UserDetail', NULL, 'N', 52, 'Y', 3, '2025-08-19 21:23:19', 'eoffice'),
(82, 'User', NULL, 'Delete', '/master-data/user/delete/:useId', '../views/master-data/user', 'UserDelete', 'UserDelete', NULL, 'N', 52, 'Y', 4, '2025-08-19 21:23:19', 'eoffice'),
(83, 'Attendance', NULL, 'Attendance', '/attendance', '../views/attendance', '', '', 'cilCalendar', 'Y', NULL, 'Y', 2, '2025-09-18 16:47:00', 'eoffice'),
(84, 'Daily', NULL, 'Daily', '/attendance/daily', '../views/attendance', 'DailyAttendance', 'DailyAttendance', 'cilClock', 'Y', 83, 'Y', 1, '2025-08-24 20:15:30', 'eoffice'),
(85, 'History', NULL, 'History', '/attendance/history', '../views/attendance', 'HistoryAttendance', 'HistoryAttendance', 'cilHistory', 'Y', 83, 'Y', 2, '2025-08-24 20:18:01', 'eoffice'),
(86, 'Role', NULL, 'Access', '/master-data/role/accesst/:rolId', '../views/master-data/role', 'RoleAccess', 'RoleAccess', NULL, 'N', 53, 'Y', 5, '2025-08-23 16:44:46', 'eoffice'),
(87, 'Object', NULL, 'Copy', '/master-data/object/:objId/copy', '../views/master-data/object', 'ObjectCopy', 'ObjectCopy', NULL, 'N', 57, 'Y', 5, '2025-08-23 16:44:46', 'eoffice'),
(92, 'Configuration', NULL, 'All', '#', '../views/configuration', '', '', 'cilCog', 'Y', NULL, 'Y', 5, '2025-08-19 21:51:32', 'eoffice'),
(93, 'Reference', NULL, 'View', '/configuration/reference', '../views/configuration/reference', 'ReferenceList', 'ReferenceList', 'cilEqualizer', 'Y', 92, 'Y', 1, '2025-09-07 14:49:06', 'eoffice'),
(94, 'Approval', NULL, 'Approval', '/attendance/approval', '../views/attendance', 'ApprovalAttendance', 'ApprovalAttendance', 'cilCheck', 'Y', 83, 'Y', 4, '2025-09-13 21:57:27', 'eoffice'),
(95, 'Correction', NULL, 'Correction', '/attendance/correction', '../views/attendance', 'CorrectionAttendance', 'CorrectionAttendance', 'cilCalendarCheck', 'Y', 83, 'Y', 3, '2025-09-13 21:57:44', 'eoffice'),
(96, 'Reference', NULL, 'Create', '/configuration/reference/create', '../views/configuration/reference', 'ReferenceCreate', 'ReferenceCreate', NULL, 'N', 93, 'Y', 1, '2025-09-14 17:08:18', 'eoffice'),
(97, 'Reference', NULL, 'Edit', '/configuration/reference/edit/:rfhId', '../views/configuration/reference', 'ReferenceEdit', 'ReferenceEdit', NULL, 'N', 93, 'Y', 2, '2025-09-14 17:08:26', 'eoffice'),
(98, 'Reference', NULL, 'Detail', '/configuration/reference/detail/:rfhId', '../views/configuration/reference', 'ReferenceDetail', 'ReferenceDetail', NULL, 'N', 93, 'Y', 3, '2025-09-14 17:08:35', 'eoffice'),
(99, 'Reference', NULL, 'Delete', '/configuration/reference/delete/:rfhId', '../views/configuration/reference', 'ReferenceDelete', 'ReferenceDelete', NULL, 'N', 93, 'Y', 4, '2025-09-14 17:08:43', 'eoffice'),
(100, 'On Leave', NULL, 'On Leave', '#', '../views/on-leave', '', '', 'cilHealing', 'Y', NULL, 'Y', 3, '2025-09-20 20:51:36', 'eoffice'),
(101, 'Leave Request', NULL, 'View', '/on-leave/', '../views/on-leave', 'LeaveRequestList', 'LeaveRequestList', 'cilMediaRecord', 'Y', 100, 'Y', 1, '2025-09-20 20:52:42', 'eoffice'),
(103, 'Approval', NULL, 'View', '/configuration/approval', '../views/configuration/approval', 'ApprovalList', 'ApprovalList', 'cilCheck', 'Y', 92, 'Y', 2, '2025-09-20 15:01:09', 'eoffice'),
(104, 'Approval', NULL, 'Create', '/configuration/approval/create', '../views/configuration/approval', 'ApprovalCreate', 'ApprovalCreate', NULL, 'N', 103, 'Y', 1, '2025-09-20 15:34:05', 'eoffice'),
(105, 'Approval', NULL, 'Edit', '/configuration/approval/edit/:aprId', '../views/configuration/approval', 'ApprovalEdit', 'ApprovalEdit', NULL, 'N', 103, 'Y', 2, '2025-09-20 15:34:19', 'eoffice'),
(106, 'Approval', NULL, 'Detail', '/configuration/approval/detail/:aprId', '../views/configuration/approval', 'ApprovalDetail', 'ApprovalDetail', NULL, 'N', 103, 'Y', 3, '2025-09-20 15:34:31', 'eoffice'),
(107, 'Approval', NULL, 'Delete', '/configuration/approval/delete/:aprId', '../views/configuration/approval', 'ApprovalDelete', 'ApprovalDelete', NULL, 'N', 103, 'Y', 4, '2025-09-20 15:34:39', 'eoffice'),
(108, 'Leave Request', NULL, 'Create', '/on-leave/create', '../views/on-leave', 'LeaveRequestCreate', 'LeaveRequestCreate', '', 'N', 101, 'Y', 1, '2025-09-20 20:57:49', 'eoffice'),
(109, 'Leave Request', NULL, 'Edit', '/on-leave/edit/:onlId', '../views/on-leave', 'LeaveRequestEdit', 'LeaveRequestEdit', '', 'N', 101, 'Y', 2, '2025-09-20 20:58:36', 'eoffice'),
(110, 'Leave Request', NULL, 'Detail', '/on-leave/detail/:onlId', '../views/on-leave', 'LeaveRequestDetail', 'LeaveRequestDetail', '', 'N', 101, 'Y', 3, '2025-09-20 20:59:24', 'eoffice'),
(111, 'Leave Request', NULL, 'Delete', '/on-leave/delete/:onlId', '../views/on-leave', 'LeaveRequestDelete', 'LeaveRequestDelete', '', 'N', 101, 'Y', 4, '2025-09-20 21:00:15', 'eoffice'),
(112, 'Leave Approval', NULL, 'View', '/on-leave/approval', '../views/on-leave', 'LeaveApprovalList', 'LeaveApprovalList', 'cilMediaRecord', 'Y', 100, 'Y', 2, '2025-09-20 21:18:02', 'eoffice');

-- --------------------------------------------------------

--
-- Table structure for table `on_leave`
--

CREATE TABLE `on_leave` (
  `onl_id` int NOT NULL,
  `use_id` int DEFAULT NULL,
  `emp_id` int DEFAULT NULL,
  `pos_id` int DEFAULT NULL,
  `div_id` int DEFAULT NULL,
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NOT NULL,
  `qty` int DEFAULT NULL,
  `onl_type` varchar(255) DEFAULT NULL,
  `activity` varchar(100) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `on_leave`
--

INSERT INTO `on_leave` (`onl_id`, `use_id`, `emp_id`, `pos_id`, `div_id`, `start_date`, `end_date`, `qty`, `onl_type`, `activity`, `remarks`, `status`, `created_date`, `created_by`) VALUES
(4, 11, 1016, 2, 1, '2025-09-25 00:00:00', '2025-09-27 00:00:00', 3, 'Cuti Tahunan', 'Liburan', '-', 'DRAFT', '2025-09-20 22:08:39', 'eoffice'),
(5, 11, 1016, 2, 1, '2025-09-25 00:00:00', '2025-09-27 00:00:00', 3, 'Cuti Khusus', '-', '-', 'DRAFT', '2025-09-20 23:32:47', 'eoffice');

-- --------------------------------------------------------

--
-- Table structure for table `outgoing_work`
--

CREATE TABLE `outgoing_work` (
  `out_id` int NOT NULL,
  `emp_id` int NOT NULL,
  `pos_id` int NOT NULL,
  `div_id` int NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `overtime`
--

CREATE TABLE `overtime` (
  `ove_id` int NOT NULL,
  `emp_id` int NOT NULL,
  `pos_id` int NOT NULL,
  `div_id` int NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `pay_id` int NOT NULL,
  `emp_id` int NOT NULL,
  `pos_id` int NOT NULL,
  `div_id` int NOT NULL,
  `salary` varchar(255) NOT NULL,
  `onl_id` int NOT NULL,
  `ove_id` int NOT NULL,
  `out_id` int NOT NULL,
  `nominal_1` varchar(255) NOT NULL,
  `nominal_2` varchar(255) NOT NULL,
  `nominal_3` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL,
  `remarks` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `position`
--

CREATE TABLE `position` (
  `pos_id` int NOT NULL,
  `position_code` varchar(30) NOT NULL,
  `position_name` varchar(255) NOT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `position`
--

INSERT INTO `position` (`pos_id`, `position_code`, `position_name`, `created_date`, `created_by`) VALUES
(1, 'POS001', 'HR Manager', '2025-04-08 07:25:34', 'admin'),
(2, 'POS002', 'Software Engineer', '2025-04-08 07:25:34', 'admin'),
(3, 'POS003', 'Finance Analyst', '2025-04-08 07:25:34', 'admin'),
(4, 'POS004', 'Marketing Specialist', '2025-04-08 07:25:34', 'admin'),
(5, 'POS005', 'Sales Executive', '2025-04-08 07:25:34', 'admin'),
(6, 'POS006', 'Legal Counsel', '2025-04-08 07:25:34', 'admin'),
(7, 'POS007', 'Operations Manager', '2025-04-08 07:25:34', 'admin'),
(8, 'POS008', 'Support Specialist', '2025-04-08 07:25:34', 'admin'),
(9, 'POS009', 'R&D Engineer', '2025-04-08 07:25:34', 'admin'),
(10, 'POS010', 'Customer Service', '2025-04-24 00:39:01', 'eoffice');

-- --------------------------------------------------------

--
-- Table structure for table `reference_detail`
--

CREATE TABLE `reference_detail` (
  `rfd_id` int NOT NULL,
  `rfh_id` int NOT NULL,
  `reference_key` varchar(255) NOT NULL,
  `reference_value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `reference_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `description` text,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_date` datetime DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `reference_detail`
--

INSERT INTO `reference_detail` (`rfd_id`, `rfh_id`, `reference_key`, `reference_value`, `reference_type`, `description`, `created_date`, `created_by`, `updated_date`, `updated_by`) VALUES
(41, 7, 'Single', 'Single', NULL, NULL, '2025-09-16 11:39:13', NULL, '2025-09-16 18:39:13', 'eoffice'),
(42, 7, 'Married', 'Married', NULL, NULL, '2025-09-16 11:39:13', NULL, '2025-09-16 18:39:13', 'eoffice'),
(47, 1, 'WFO', 'Work From Offiice', NULL, NULL, '2025-09-17 07:00:42', NULL, '2025-09-17 14:00:42', 'eoffice'),
(48, 1, 'WFH', 'Work From Home', NULL, NULL, '2025-09-17 07:00:42', NULL, '2025-09-17 14:00:42', 'eoffice'),
(49, 1, 'WFS', 'Work From Site', NULL, NULL, '2025-09-17 07:00:42', NULL, '2025-09-17 14:00:42', 'eoffice'),
(50, 1, 'WFA', 'Work From Anywhere', NULL, NULL, '2025-09-17 07:00:42', NULL, '2025-09-17 14:00:42', 'eoffice'),
(54, 6, 'Female', 'Female', NULL, NULL, '2025-09-17 08:05:42', NULL, '2025-09-17 15:05:43', 'eoffice'),
(55, 6, 'Male', 'Male', NULL, NULL, '2025-09-17 08:05:42', NULL, '2025-09-17 15:05:43', 'eoffice'),
(64, 11, 'Hadir', 'Hadir', NULL, NULL, '2025-09-18 09:31:26', NULL, '2025-09-18 16:31:27', 'eoffice'),
(65, 11, 'Ijin', 'Ijin', NULL, NULL, '2025-09-18 09:31:26', NULL, '2025-09-18 16:31:27', 'eoffice'),
(66, 11, 'Sakit', 'Sakit', NULL, NULL, '2025-09-18 09:31:26', NULL, '2025-09-18 16:31:27', 'eoffice'),
(71, 13, 'Tahunan', 'Cuti Tahunan', NULL, NULL, '2025-09-19 10:35:22', NULL, '2025-09-19 17:35:23', 'eoffice'),
(72, 13, 'Khusus', 'Cuti Khusus', NULL, NULL, '2025-09-19 10:35:22', NULL, '2025-09-19 17:35:23', 'eoffice'),
(73, 13, 'Ibadah', 'Cuti Ibadah', NULL, NULL, '2025-09-19 10:35:22', NULL, '2025-09-19 17:35:23', 'eoffice'),
(74, 13, 'Melahirkan', 'Cuti Melahirkan', NULL, NULL, '2025-09-19 10:35:22', NULL, '2025-09-19 17:35:23', 'eoffice'),
(80, 14, 'D', 'Draft', NULL, NULL, '2025-09-20 16:26:07', NULL, '2025-09-20 23:26:08', 'eoffice'),
(81, 14, 'S', 'Submitted', NULL, NULL, '2025-09-20 16:26:07', NULL, '2025-09-20 23:26:08', 'eoffice'),
(82, 14, 'P', 'Pending', NULL, NULL, '2025-09-20 16:26:07', NULL, '2025-09-20 23:26:08', 'eoffice'),
(83, 14, 'A', 'Approved', NULL, NULL, '2025-09-20 16:26:07', NULL, '2025-09-20 23:26:08', 'eoffice'),
(84, 14, 'R', 'Rejected', NULL, NULL, '2025-09-20 16:26:07', NULL, '2025-09-20 23:26:08', 'eoffice'),
(87, 12, 'CLOCKINWEEKDAYMAX', '09:00', NULL, NULL, '2025-09-21 11:09:23', NULL, '2025-09-21 18:09:23', 'eoffice'),
(88, 12, 'CLOCKOUTWEEKDAYMAX', '23:30', NULL, NULL, '2025-09-21 11:09:23', NULL, '2025-09-21 18:09:23', 'eoffice'),
(89, 12, 'CLOCKINWEEKENDMAX', '11:30', NULL, NULL, '2025-09-21 11:09:23', NULL, '2025-09-21 18:09:23', 'eoffice'),
(90, 12, 'CLOCKOUTWEEKENDMAX', '23:30', NULL, NULL, '2025-09-21 11:09:23', NULL, '2025-09-21 18:09:23', 'eoffice');

-- --------------------------------------------------------

--
-- Table structure for table `reference_header`
--

CREATE TABLE `reference_header` (
  `rfh_id` int NOT NULL,
  `reference_code` varchar(255) NOT NULL,
  `reference_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `description` text,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_date` datetime DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `reference_header`
--

INSERT INTO `reference_header` (`rfh_id`, `reference_code`, `reference_name`, `description`, `created_date`, `created_by`, `updated_date`, `updated_by`) VALUES
(1, 'ATTENDANCEVIA', 'Attendance Via', 'Attendance Via', '2025-09-15 23:39:29', 'eoffice', '2025-09-17 14:00:42', 'eoffice'),
(6, 'GENDERTYPE', 'Gender Type', 'Gender Type', '2025-09-16 09:27:58', 'eoffice', '2025-09-17 15:05:43', 'eoffice'),
(7, 'STATUSFAMILY', 'Status Family', 'Status Family', '2025-09-16 16:58:50', 'eoffice', '2025-09-16 18:39:13', 'eoffice'),
(11, 'ATTENDANCETYPE', 'Attendance Type', 'Attendance Type', '2025-09-17 14:01:56', 'eoffice', '2025-09-18 16:31:27', 'eoffice'),
(12, 'ATTENDANCETIME', 'Attendance Time', 'Attendance Time', '2025-09-17 15:57:47', 'eoffice', '2025-09-21 18:09:23', 'eoffice'),
(13, 'ONLEAVETYPE', 'On Leave Type', 'On Leave Type', '2025-09-19 17:35:05', 'eoffice', '2025-09-19 17:35:23', 'eoffice'),
(14, 'ONLEAVESTATUS', 'On Leave Status', 'On Leave Status', '2025-09-20 23:20:58', 'eoffice', '2025-09-20 23:26:08', 'eoffice');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `rol_id` int NOT NULL,
  `role_name` varchar(255) NOT NULL,
  `role_code` varchar(255) DEFAULT NULL,
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`rol_id`, `role_name`, `role_code`, `created_date`, `created_by`) VALUES
(1, 'Administrator', NULL, '2025-04-10 23:43:40', 'eoffice'),
(2, 'Officer', NULL, '2025-04-10 23:44:08', 'eoffice'),
(3, 'Manager', NULL, '2025-04-10 23:45:46', 'eoffice'),
(4, 'Audit Internal', NULL, '2025-04-12 01:08:22', 'eoffice'),
(5, 'Staff', NULL, '2025-04-10 09:04:00', 'system'),
(6, 'Executive', NULL, '2025-04-10 09:05:00', 'system'),
(7, 'Project Manager', NULL, '2025-04-10 09:06:00', 'system'),
(8, 'Recruiter', NULL, '2025-04-10 09:07:00', 'system'),
(9, 'Internship', NULL, '2025-04-12 01:08:38', 'eoffice');

-- --------------------------------------------------------

--
-- Table structure for table `role_object`
--

CREATE TABLE `role_object` (
  `rob_id` int NOT NULL,
  `rol_id` int NOT NULL,
  `role_code` varchar(255) DEFAULT NULL,
  `obj_id` int NOT NULL,
  `object_code` varchar(255) DEFAULT NULL,
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `role_object`
--

INSERT INTO `role_object` (`rob_id`, `rol_id`, `role_code`, `obj_id`, `object_code`, `created_date`, `created_by`) VALUES
(643, 4, NULL, 54, NULL, '2025-09-01 11:57:51', 'SYSTEM'),
(757, 15, NULL, 83, NULL, '2025-09-05 23:04:16', 'SYSTEM'),
(758, 15, NULL, 59, NULL, '2025-09-05 23:04:16', 'SYSTEM'),
(1136, 1, NULL, 48, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1137, 1, NULL, 49, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1138, 1, NULL, 59, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1139, 1, NULL, 61, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1140, 1, NULL, 67, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1141, 1, NULL, 71, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1142, 1, NULL, 75, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1143, 1, NULL, 79, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1144, 1, NULL, 84, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1145, 1, NULL, 93, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1146, 1, NULL, 96, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1147, 1, NULL, 101, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1148, 1, NULL, 104, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1149, 1, NULL, 108, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1150, 1, NULL, 50, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1151, 1, NULL, 62, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1152, 1, NULL, 66, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1153, 1, NULL, 68, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1154, 1, NULL, 72, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1155, 1, NULL, 76, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1156, 1, NULL, 80, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1157, 1, NULL, 83, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1158, 1, NULL, 85, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1159, 1, NULL, 97, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1160, 1, NULL, 103, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1161, 1, NULL, 105, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1162, 1, NULL, 109, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1163, 1, NULL, 112, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1164, 1, NULL, 51, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1165, 1, NULL, 54, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1166, 1, NULL, 63, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1167, 1, NULL, 65, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1168, 1, NULL, 69, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1169, 1, NULL, 73, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1170, 1, NULL, 77, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1171, 1, NULL, 81, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1172, 1, NULL, 95, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1173, 1, NULL, 98, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1174, 1, NULL, 100, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1175, 1, NULL, 106, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1176, 1, NULL, 110, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1177, 1, NULL, 52, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1178, 1, NULL, 60, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1179, 1, NULL, 64, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1180, 1, NULL, 70, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1181, 1, NULL, 74, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1182, 1, NULL, 78, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1183, 1, NULL, 82, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1184, 1, NULL, 92, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1185, 1, NULL, 94, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1186, 1, NULL, 99, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1187, 1, NULL, 107, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1188, 1, NULL, 111, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1189, 1, NULL, 53, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1190, 1, NULL, 86, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1191, 1, NULL, 87, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1192, 1, NULL, 57, NULL, '2025-09-20 21:24:39', 'SYSTEM'),
(1209, 2, NULL, 59, NULL, '2025-09-22 22:00:22', 'SYSTEM'),
(1210, 2, NULL, 83, NULL, '2025-09-22 22:00:22', 'SYSTEM'),
(1211, 2, NULL, 84, NULL, '2025-09-22 22:00:22', 'SYSTEM'),
(1212, 2, NULL, 85, NULL, '2025-09-22 22:00:22', 'SYSTEM'),
(1213, 2, NULL, 100, NULL, '2025-09-22 22:00:22', 'SYSTEM'),
(1214, 2, NULL, 101, NULL, '2025-09-22 22:00:22', 'SYSTEM'),
(1215, 2, NULL, 112, NULL, '2025-09-22 22:00:22', 'SYSTEM'),
(1216, 2, NULL, 108, NULL, '2025-09-22 22:00:22', 'SYSTEM'),
(1217, 2, NULL, 109, NULL, '2025-09-22 22:00:22', 'SYSTEM'),
(1218, 2, NULL, 110, NULL, '2025-09-22 22:00:22', 'SYSTEM'),
(1219, 2, NULL, 111, NULL, '2025-09-22 22:00:22', 'SYSTEM'),
(1220, 2, NULL, 95, NULL, '2025-09-22 22:00:22', 'SYSTEM'),
(1221, 2, NULL, 94, NULL, '2025-09-22 22:00:22', 'SYSTEM');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `use_id` int NOT NULL,
  `emp_id` int DEFAULT NULL,
  `rol_id` int DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `token` text,
  `status` varchar(255) NOT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`use_id`, `emp_id`, `rol_id`, `username`, `email`, `password`, `token`, `status`, `created_date`, `created_by`) VALUES
(1, 1, 1, 'johndoe', 'johndoe@mail.com', '$2b$10$VQdowpcuGkZIcOIjrb3lXegYmkpRi1ITiVQXYmymfXg47MbSoZrla', NULL, 'Y', '2025-04-12 16:23:02', 'eoffice'),
(2, 2, 2, 'janesmith', 'janesmith@mail.com', '$2b$10$3kUZAHpbrXMuuSD/BTBvIOjRogfuAW/0rpwa52lCEKv3B.9Yca48y', NULL, 'Y', '2025-04-12 16:23:27', 'eoffice'),
(3, 3, 3, 'robertbrown', 'robert@mail.com', '$2b$10$Ajm2.R..CUA2jV9UBexbmu3RHKo7PlZEFC0iMugKVlAIvnrHufcrW', NULL, 'Y', '2025-04-24 21:31:27', 'eoffice'),
(4, 4, 1, 'alicejohnson', 'alice.johnson@mail.com', '$2b$10$p0sxHxPuiSdO4ODNqqAM/eU8mx7YCDArmugYu.tGrqeyFYKnaVp8m', NULL, 'Y', '2025-04-12 16:24:41', 'eoffice'),
(5, 5, 2, 'michaelwhite', 'michael@mail.com', '$2b$10$XIvZsoAdVnG.scqgPhHmNOSu3XgbE1.OEQKfeyJZxAj38DllNfSRK', NULL, 'Y', '2025-04-12 16:25:25', 'eoffice'),
(6, 6, 3, 'emilygreen', 'emilygreen@mail.com', '$2b$10$pFm8efpaVlIssWXx2eFQGOba2uX03KTCA6pc6JM9F7Zjko10jAwvW', NULL, 'Y', '2025-04-12 16:25:43', 'eoffice'),
(8, 8, 2, 'sophiawilson', 'sophiawilson@mail.com', '$2b$10$XAR8FheqyVTZh9WsMRLwgOIJmMUj5oWPirNurIMbtKmTqESnloPfW', NULL, 'Y', '2025-04-12 16:26:18', 'eoffice'),
(11, 1016, 1, 'eoffice', 'eoffice@mail.com', '$2b$10$0PVhbMcmpXIooldghR0rPeNlyPK6NSOKrnn.bj5xQIvUlh6oFnFd6', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VJZCI6MTEsInVzZXJuYW1lIjoiZW9mZmljZSIsInJvbElkIjoxLCJpYXQiOjE3NTg1NTY4MzYsImV4cCI6MTc1OTE2MTYzNn0.cqSbrRLET1T-RdwJw3xpvvCQcjx3GQWB6CAJWotSJYE', 'Y', '2025-04-12 00:57:08', 'eoffice'),
(13, 1015, 2, 'dewiwandhani', 'test@mail.com', '$2b$10$0PVhbMcmpXIooldghR0rPeNlyPK6NSOKrnn.bj5xQIvUlh6oFnFd6', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VJZCI6MTMsInVzZXJuYW1lIjoiZGV3aXdhbmRoYW5pIiwicm9sSWQiOjIsImlhdCI6MTc1ODU1MzIzOCwiZXhwIjoxNzU5MTU4MDM4fQ.QT6Hl1066LsjBi4mLLIDKkAdj2glQyFwfydljLVAPcQ', 'Y', '2025-08-23 22:20:16', 'eoffice');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `approval`
--
ALTER TABLE `approval`
  ADD PRIMARY KEY (`apr_id`);

--
-- Indexes for table `approval_config`
--
ALTER TABLE `approval_config`
  ADD PRIMARY KEY (`apc_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`att_id`);

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
-- Indexes for table `object`
--
ALTER TABLE `object`
  ADD PRIMARY KEY (`obj_id`),
  ADD KEY `parent_obj_id` (`parent_obj_id`);

--
-- Indexes for table `on_leave`
--
ALTER TABLE `on_leave`
  ADD PRIMARY KEY (`onl_id`);

--
-- Indexes for table `position`
--
ALTER TABLE `position`
  ADD PRIMARY KEY (`pos_id`);

--
-- Indexes for table `reference_detail`
--
ALTER TABLE `reference_detail`
  ADD PRIMARY KEY (`rfd_id`),
  ADD UNIQUE KEY `unique_key_per_group` (`rfh_id`,`reference_key`);

--
-- Indexes for table `reference_header`
--
ALTER TABLE `reference_header`
  ADD PRIMARY KEY (`rfh_id`),
  ADD UNIQUE KEY `reference_code` (`reference_code`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`rol_id`);

--
-- Indexes for table `role_object`
--
ALTER TABLE `role_object`
  ADD PRIMARY KEY (`rob_id`),
  ADD KEY `rol_id` (`rol_id`),
  ADD KEY `obj_id` (`obj_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`use_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `approval`
--
ALTER TABLE `approval`
  MODIFY `apr_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `approval_config`
--
ALTER TABLE `approval_config`
  MODIFY `apc_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `att_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `division`
--
ALTER TABLE `division`
  MODIFY `div_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `emp_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1028;

--
-- AUTO_INCREMENT for table `object`
--
ALTER TABLE `object`
  MODIFY `obj_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `on_leave`
--
ALTER TABLE `on_leave`
  MODIFY `onl_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `position`
--
ALTER TABLE `position`
  MODIFY `pos_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `reference_detail`
--
ALTER TABLE `reference_detail`
  MODIFY `rfd_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `reference_header`
--
ALTER TABLE `reference_header`
  MODIFY `rfh_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `rol_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `role_object`
--
ALTER TABLE `role_object`
  MODIFY `rob_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1222;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `use_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `object`
--
ALTER TABLE `object`
  ADD CONSTRAINT `object_ibfk_1` FOREIGN KEY (`parent_obj_id`) REFERENCES `object` (`obj_id`) ON DELETE SET NULL;

--
-- Constraints for table `reference_detail`
--
ALTER TABLE `reference_detail`
  ADD CONSTRAINT `fk_reference_header` FOREIGN KEY (`rfh_id`) REFERENCES `reference_header` (`rfh_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
