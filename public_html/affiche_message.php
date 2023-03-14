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
Database::lu($dbh,$token["user_id"],$_POST['lui'],'LU');
$tab=Database::afficheMessage($dbh,$token["user_id"],$_POST['lui']);
foreach ($tab as &$value) {
    if ($value['exp']==$token["user_id"]){
        $value['exp']='outgoing';
    }
    else{
        $value['exp']='incoming';
    }
}
echo json_encode($tab);