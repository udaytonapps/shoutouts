<?php

/** Default Requests */
AppRouter::add('/', function () {
    return AppRouter::handleDefaultRequest();
}, 'get');

AppRouter::add('', function () {
    return AppRouter::handleDefaultRequest();
}, 'get');

/** Common Requests */
AppRouter::add('/me', function () {
    $res = CommonService::me();
    return AppRouter::sendJson($res);
}, 'get');

AppRouter::add('/info', function () {
    $res = CommonService::info();
    return AppRouter::sendJson($res);
}, 'get');

AppRouter::add('/roster', function () {
    $res = CommonService::roster();
    return AppRouter::sendJson($res);
}, 'get');

AppRouter::add('/tsugi-users', function () {
    $res = CommonCtr::getTsugiUsers();
    return AppRouter::sendJson($res);
}, 'get');

AppRouter::pathNotFound(function ($info) {
    echo AppRouter::handleDefaultRequest();
});

/**
 * Helper Functions
 */

// Nothing yet...