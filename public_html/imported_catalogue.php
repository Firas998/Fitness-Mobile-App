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

$token = $server->getAccessTokenData(OAuth2\Request::createFromGlobals());


$dbh = Database::connect();
$tab=Database::getImported($dbh,$token["user_id"]); // $token["user_id"]
echo json_encode($tab);