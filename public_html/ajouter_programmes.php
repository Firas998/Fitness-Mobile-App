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
if (isset($_POST['nom'],$_POST['date']) && !empty($_POST['nom'])&& !empty($_POST['date'])){
    if (Database::getIfProgNameExists($dbh, $_POST['nom'])) {
        $error = array('error' => 'Un autre programme avec ce nom existe. Veuillez en choisir un autre.','success'=>'0' );
        echo json_encode($error);
        // on arrête l'execution du programme
        exit();
    } else {
        Database::insertProg($dbh, $token["user_id"], $_POST['nom'],$_POST['date']); //rajouter le login du compte connecte
        $id = Database::getLastProgId($dbh);
        $success = array('id' => $id,'success'=>'1' );
        echo json_encode($success);
    }
} else {
    $error = array('error' => 'Veuillez remplir le champ correctement');
    echo json_encode($error);
    // on arrête l'execution du programme
    exit();
}
