<?php

require 'includes/database.class.php';
require 'headers/cors_header.php';
// include our OAuth2 Server object
require_once __DIR__ . '/server.php';

// Handle a request to a resource and authenticate the access token
if (!$server->verifyResourceRequest(OAuth2\Request::createFromGlobals())) {
    $server->getResponse()->send();
    die;
}
$dbh = Database::connect();
$token = $server->getAccessTokenData(OAuth2\Request::createFromGlobals());
Database::envoyerMessage($dbh,$token["user_id"],$_POST['lui'],$_POST['message']);
Database::lu($dbh,$_POST['lui'],$token["user_id"],'NON LU');
if (!Database::getIfCorres($dbh, $token["user_id"],$_POST['lui'])){
    Database::newCorres($dbh, $token["user_id"],$_POST['lui']);
}