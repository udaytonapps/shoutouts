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
    // Note: this one just calls the learner DAO and doesn't really need to be 
    // 'restricted' in this state, but it is generally good practice to do so....
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
    // Note: this one just calls the learner DAO and doesn't really need to be 
    // 'restricted' in this state, but it is generally good practice to do so....
    $res = LearnerCtr::getCourseComments();
    return AppRouter::sendJson($res);
}, 'get');

/** READ Received Awards */
AppRouter::add($resource . '/received', function () {
    // Note: this one just calls the learner DAO and doesn't really need to be 
    // 'restricted' in this state, but it is generally good practice to do so....
    $res = LearnerCtr::getReceivedApprovedCourseAwards();
    return AppRouter::sendJson($res);
}, 'get');

/** READ Roster of Recipients Awards */
AppRouter::add($resource . '/recipients', function () {
    // Note: this one just calls the learner DAO and doesn't really need to be 
    // 'restricted' in this state, but it is generally good practice to do so....
    $res = LearnerCtr::getRecipients();
    return AppRouter::sendJson($res);
}, 'get');

/** READ Roster of Recipients Awards */
AppRouter::add($resource . '/award-types', function () {
    // Note: this one just calls the learner DAO and doesn't really need to be 
    // 'restricted' in this state, but it is generally good practice to do so....
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

// /** READ Sent Awards */
// AppRouter::add($resource . '/sent', function () {
//     // Note: this one just calls the learner DAO and doesn't really need to be 
//     // 'restricted' in this state, but it is generally good practice to do so....
//     $res = LearnerCtr::getCourseComments();
//     return AppRouter::sendJson($res);
// }, 'get');

// /** READ Leaderboard Listing */
// AppRouter::add($resource . '/leaderboard', function () {
//     // Note: this one just calls the learner DAO and doesn't really need to be 
//     // 'restricted' in this state, but it is generally good practice to do so....
//     $res = LearnerCtr::getCourseComments();
//     return AppRouter::sendJson($res);
// }, 'get');
