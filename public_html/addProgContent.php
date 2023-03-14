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
if (isset($_POST['id'], $_POST['exo'],$_POST['descri'], $_POST['time'], $_POST['pause'], $_POST['order']) && !empty($_POST['id'])&& !empty($_POST['descri'])&& !empty($_POST['exo'])&& !empty($_POST['time'])&& !empty($_POST['pause'])&& !empty($_POST['order'])) {
    $prog_id=$_POST['id'];
    Database::insertProgCont($dbh, $prog_id, $_POST['exo'],$_POST['descri'], $_POST['time'], $_POST['pause'], $_POST['order']);
    $id=Database::getLastContId($dbh);
    echo json_encode($id);
} else {
    $error = array('error' => 'Un champ a mal ete rempli');
    echo json_encode($error);
    // on arrête l'execution du programme
    exit();
}