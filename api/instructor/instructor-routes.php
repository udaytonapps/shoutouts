<?php

/** Instructor Requests */
$resource = '/instructor';

/** Just a simple test call */
AppRouter::add($resource . '/check', CommonService::restrictToInstructor(function () {
    $res = array('Made it' => 'through!');
    return AppRouter::sendJson($res);
}), 'get');

/** CREATE */
AppRouter::add($resource . '/alerts', CommonService::restrictToInstructor(function () {
    $data = array();
    // Define the expected data
    $requiredData = array('message');
    $optionalData = array('type');
    // Assemble from JSON to PHP associative array
    $data = AppRouter::assembleRouteData($requiredData, $optionalData);
    if (!isset($data)) {
        // Reject if required data is missing
        return AppRouter::sendJson(array('error' => 'Missing parameters'));
    } else {
        $res = InstructorCtr::addAlert($data);
        return AppRouter::sendJson($res);
    }
}), 'post');

/** READ */
AppRouter::add($resource . '/alerts', CommonService::restrictToInstructor(function () {
    // Note: this one just calls the learner DAO and doesn't really need to be 
    // 'restricted' in this state, but it is generally good practice to do so....
    $res = InstructorCtr::getCourseAlerts();
    return AppRouter::sendJson($res);
}), 'get');

/** DELETE */
AppRouter::add($resource . '/alerts/([0-9]*)', CommonService::restrictToInstructor(function ($id) {
    if (!isset($id)) {
        // Reject if required data is missing
        return AppRouter::sendJson(array('error' => 'Missing parameters'));
    } else {
        $res = InstructorCtr::deleteAlert($id);
        return AppRouter::sendJson($res);
    }
}), 'delete');

/** READ all awards (grouped by learner) */
AppRouter::add($resource . '/awards', CommonService::restrictToInstructor(function () {
    $res = InstructorCtr::getAllAwards();
    return AppRouter::sendJson($res);
}), 'get');

/** READ all awards history */
AppRouter::add($resource . '/history', CommonService::restrictToInstructor(function () {
    $res = InstructorCtr::getAwardsHistory();
    return AppRouter::sendJson($res);
}), 'get');

/** READ Pending Award Listing */
AppRouter::add($resource . '/pending', CommonService::restrictToInstructor(function () {
    $res = InstructorCtr::getPendingAwards();
    return AppRouter::sendJson($res);
}), 'get');

/** Update the request (accept or reject) */
AppRouter::add($resource . '/awards', CommonService::restrictToInstructor(function () {
    $data = array();
    // Define the expected data
    $requiredData = array('id', 'status');
    $optionalData = array('instructorComment');
    // Assemble from JSON to PHP associative array
    $data = AppRouter::assembleRouteData($requiredData, $optionalData);
    if (!isset($data)) {
        // Reject if required data is missing
        return AppRouter::sendJson(array('error' => 'Missing parameters'));
    } else {
        $res = InstructorCtr::updateAward($data);
        return AppRouter::sendJson($res);
    }
}), 'put');

/** READ configuration */
AppRouter::add($resource . '/configuration', function () {
    $res = InstructorCtr::getConfiguration();
    return AppRouter::sendJson($res);
}, 'get');

/** Add a configuration for the context */
AppRouter::add($resource . '/configuration', CommonService::restrictToInstructor(function () {
    // Define the expected data
    $requiredData = array('configuration', 'exclusionIds');
    $optionalData = array();
    // Assemble from JSON to PHP associative array
    $data = AppRouter::assembleRouteData($requiredData, $optionalData);
    if (
        !isset($data)
    ) {
        // Reject if required data is missing
        return AppRouter::sendJson(array('error' => 'Missing parameters'));
    } else {
        // Process the request
        $res = InstructorCtr::addConfiguration($data);
        return AppRouter::sendJson($res);
    }
}), 'post');

/** Update a configuration for the context */
AppRouter::add($resource . '/configuration', CommonService::restrictToInstructor(function () {
    // Define the expected data
    $requiredData = array('configuration', 'exclusionIds');
    $optionalData = array();
    // Assemble from JSON to PHP associative array
    $data = AppRouter::assembleRouteData($requiredData, $optionalData);
    if (!isset($data)) {
        // Reject if required data is missing
        return AppRouter::sendJson(array('error' => 'Missing parameters'));
    } else {
        $res = InstructorCtr::updateConfiguration($data);
        return AppRouter::sendJson($res);
    }
}), 'put');

/** READ Roster of Recipients Awards */
AppRouter::add($resource . '/award-types', function () {
    $res = InstructorCtr::getAllAwardTypes();
    return AppRouter::sendJson($res);
}, 'get');
