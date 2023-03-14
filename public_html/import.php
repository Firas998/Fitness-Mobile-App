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
if (!Database::getIfAlreadyImported($dbh,$token["user_id"], $_POST['prog'])){
    $success=array('success'=>'1');
    Database::import($dbh, $token["user_id"], $_POST['prog'],$_POST['impo']);
    echo json_encode($success);
}
else {
    $success=array('success'=>'0', 'error'=>'Contenu deja importe');
    echo json_encode($success);
}
