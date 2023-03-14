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
$tab=Database::afficheCalendrier($dbh,$token["user_id"],$_POST['mois'],$_POST['annee']);
echo json_encode($tab);