<?php

/** Learner Requests */
$resource = '/learner';

/** Just a simple test call */
AppRouter::add($resource . '/check', function () {
    $res = array('Made it' => 'through!');
    return AppRouter::sendJson($res);
}, 'get');

/** READ */
AppRouter::add($resource . '/alerts', function () {
    $res = LearnerCtr::getCourseAlerts();
    return AppRouter::sendJson($res);
}, 'get');

/** CREATE */
AppRouter::add($resource . '/comments', function () {
    $data = array();
    // Define the expected data
    $requiredData = array('text');
    $optionalData = array();
    // Assemble from JSON to PHP associative array
    $data = AppRouter::assembleRouteData($requiredData, $optionalData);
    if (!isset($data)) {
        // Reject if required data is missing
        return AppRouter::sendJson(array('error' => 'Missing parameters'));
    } else {
        $res = LearnerCtr::addComment($data);
        return AppRouter::sendJson($res);
    }
}, 'post');

/** READ */
AppRouter::add($resource . '/comments', function () {
    $res = LearnerCtr::getCourseComments();
    return AppRouter::sendJson($res);
}, 'get');

// AWARDS

/** READ configuration */
AppRouter::add($resource . '/configuration', function () {
    $res = LearnerCtr::getContextConfiguration();
    return AppRouter::sendJson($res);
}, 'get');

/** READ Received Awards */
AppRouter::add($resource . '/received', function () {
    $res = LearnerCtr::getReceivedApprovedCourseAwards();
    return AppRouter::sendJson($res);
}, 'get');

/** READ Sent Awards */
AppRouter::add($resource . '/sent', function () {
    $res = LearnerCtr::getSentCourseAwards();
    return AppRouter::sendJson($res);
}, 'get');

/** READ Roster of Recipients Awards */
AppRouter::add($resource . '/recipients', function () {
    $res = LearnerCtr::getRecipients();
    return AppRouter::sendJson($res);
}, 'get');

/** READ Award Types */
AppRouter::add($resource . '/award-types', function () {
    $res = LearnerCtr::getEnabledAwardTypes();
    return AppRouter::sendJson($res);
}, 'get');

/** CREATE (send) award */
AppRouter::add($resource . '/awards', function () {
    $data = array();
    // Define the expected data
    $requiredData = array('recipientId', 'awardTypeId');
    $optionalData = array('comment');
    // Assemble from JSON to PHP associative array
    $data = AppRouter::assembleRouteData($requiredData, $optionalData);
    if (!isset($data)) {
        // Reject if required data is missing
        return AppRouter::sendJson(array('error' => 'Missing parameters'));
    } else {
        $res = LearnerCtr::addAward($data);
        return AppRouter::sendJson($res);
    }
}, 'post');

/** READ Leaderboard Listing */
AppRouter::add($resource . '/leaderboard', function () {
    $res = LearnerCtr::getLeaderboard();
    return AppRouter::sendJson($res);
}, 'get');
