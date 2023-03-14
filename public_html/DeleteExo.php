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
$ancien=Database::ImageExo($dbh,$_POST['id']);
if ($ancien != 'rien'){
    unlink ('upload/'.$ancien.'.jpg');
}
Database::DeleteExo($dbh,$_POST['id']);