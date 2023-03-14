
<?php

require 'includes/database.class.php';
require 'headers/cors_header.php';
// include our OAuth2 Server object
require_once __DIR__ . '/server.php';

// // Handle a request to a resource and authenticate the access token
// if (!$server->verifyResourceRequest(OAuth2\Request::createFromGlobals())) {
//     $server->getResponse()->send();
//     die;
// }

$t=strval(time());
$dbh = Database::connect();
// On récupère la valeur du champ HTML input type='file' qui s'appelle "photo" et on vérifie que l'upload s'est bien passé
if (!empty($_FILES['photo']['tmp_name']) && is_uploaded_file($_FILES['photo']['tmp_name'])) {
    // on récupère les propriétés de l'image
    list($larg, $haut, $type, $attr) = getimagesize($_FILES['photo']['tmp_name']);
    // on vérifie que l'on a bien un type = 2 = JPEG
    if ($type == 2) {
        // on construit le chemin dans lequel on va sauvegarder la photo envoyée
        // générer un nom unique pour éviter les collisions (PHP écrasera les fichiers de même nom), regardez du côté de rand() ou time() sur la doc de php.net
        $pathPhoto = "upload/".$t.".jpg"; // à modifier

        if (!move_uploaded_file($_FILES["photo"]["tmp_name"], $pathPhoto)) {
            // message Json d'erreur "échec upload" à écrire
            $success=array('message'=>'Upload a échoué');
            echo json_encode($success);
        } else {
            // message Json de succès à écrire
            
            $success=array('message'=>'Upload réussi', 'path'=>$t);
            Database::ajouteImageProg($dbh,$_POST['id'],$t);
            echo json_encode($success);
        }
    } else {
        // message Json d'erreur "format d'image invalide" à écrire
        $success=array('message'=>'Le format du fichier image est invalide');
            echo json_encode($success);
    }
} else {
    // message Json d'erreur "échec upload" à écrire
    $success=array('message'=>'Upload a échoué');
    echo json_encode($success);
}