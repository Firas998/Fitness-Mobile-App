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
if (isset($_POST['keyword']) && !empty($_POST['keyword'])) {
    $tab_programs=Database::searchProgContByName($dbh,$_POST['keyword']);
    echo json_encode($tab_programs);
    
} else {
    $error = array('error' => 'Veuillez remplir le champs correctement!');
    echo json_encode($error);
    // on arrête l'execution du programme
    exit();
}