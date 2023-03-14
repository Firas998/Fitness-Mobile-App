<?php

require 'includes/database.class.php';
require 'headers/cors_header.php';
$dbh = Database::connect();
if (isset($_POST['identifiant'], $_POST['password'], $_POST['confirmation'], $_POST['fname'], $_POST['lname'], $_POST['email'], $_POST['birthday'], $_POST['birthmonth'], $_POST['birthyear']) && !empty($_POST['identifiant']) && !empty($_POST['birthday']) && !empty($_POST['birthmonth']) && !empty($_POST['birthyear']) && !empty($_POST['password']) && !empty($_POST['confirmation']) && !empty($_POST['fname']) && !empty($_POST['lname']) && !empty($_POST['email']) && filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
    if ($_POST['password'] == $_POST['confirmation']) {
        if (Database::getIfUserExists($dbh, $_POST['identifiant'])) {
            $error = array('error' => 'Identifiant existant. Veuillez en choisir un autre.');
            echo json_encode($error);
            // on arrête l'execution du programme
            exit();
        } else {
            $tab = Database::insertUser($dbh, $_POST['identifiant'], $_POST['password'], $_POST['fname'], $_POST['lname'], $_POST['email'], $_POST['birthday'], $_POST['birthmonth'], $_POST['birthyear']);
            $success = array('success' => 1);
            echo json_encode($success);
        }
    } else {
        $error = array('error' => 'Veuillez remplir les deux mots de passe de facon identique');
        echo json_encode($error);
        // on arrête l'execution du programme
        exit();
    }
} else {
    $error = array('error' => 'ERREUR. Verifier si tout les champs sont existants et remplis correctement.');
    echo json_encode($error);
    // on arrête l'execution du programme
    exit();
}
