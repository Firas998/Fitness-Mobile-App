<?php

class Database
{

    public static function connect()
    {
        $dbName   = 'projet';
        $dbServer = '127.0.0.1';
        $dbUser   = 'root';
        $dbPass   = 'OTqq4sUuiWaQGbm9';

        $dsn = 'mysql:dbname=' . $dbName . ';host=' . $dbServer;
        $dbh = null;
        try {
            $dbh = new PDO($dsn, $dbUser, $dbPass, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"));
            $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            return false;
        }

        return $dbh;
    }
  
    public static function getIfUserExists($dbh, $login)
    {
        $query = "SELECT * FROM oauth_users WHERE username=?";
        $sth = $dbh->prepare($query);
        $sth->execute([$login]);
        $result = $sth->fetchAll(PDO::FETCH_COLUMN);
        $np = count($result);
        if ($np == 0) {
            return false;
        } else {
            return true;
        }
    }
    public static function getIfAlreadyImported($dbh, $moi, $prog)
    {
        $query = "SELECT * FROM importation WHERE `login`=? AND prog=?";
        $sth = $dbh->prepare($query);
        $sth->execute([$moi,$prog]);
        $result = $sth->fetchAll(PDO::FETCH_COLUMN);
        $np = count($result);
        if ($np == 0) {
            return false;
        } else {
            return true;
        }
    }
    public static function insertUser($dbh, $login, $password, $fname, $lname, $email, $day, $month, $year)
    {
        $query = "INSERT INTO oauth_users (username, password, first_name, last_name, email) VALUES (?, SHA1(?), ?, ?, ?);";
        $sth = $dbh->prepare($query);
        $sth->execute([$login, $password, $fname, $lname, $email]);
        
    }

    

   
    
    public static function insertProg($dbh, $login, $name,$date)
    {
        $query = "INSERT INTO programs(login, name,creation) VALUES (?, ?,?);";
        $sth = $dbh->prepare($query);
        $sth->execute([$login, $name,$date]);
    }

    public static function insertProgCont($dbh, $prog, $exo, $descri, $time, $pause, $order)
    {
        $query = "INSERT INTO `prog_content`(`prog`, `exo`, `descri`, `time`, `pause`, `ordre`) VALUES (?,?,?,?,?,?)";
        $sth = $dbh->prepare($query);
        $prog0=intval($prog);
        $time0=intval($time);
        $pause0=intval($pause);
        $order0=intval($order);
        $sth->execute([$prog0,$exo,$descri,$time0,$pause0,$order0]);
    }
    public static function changeProgOrder($dbh, $data)
    {
        for ($i=0; $i<count($data); $i++) {
            $query = "UPDATE `prog_content` SET `ordre`=? WHERE `id`=?";
            $sth = $dbh->prepare($query);
            $sth->execute([$data[$i]['order'],$data[$i]['id']]);
        }
    }

    public static function insertProd($dbh, $prod, $energy)
    {
        $query = "INSERT INTO prog_content (produit, energy) VALUES (?, ?);";
        $sth = $dbh->prepare($query);
        $sth->execute([$prod, $energy]);
    }
    public static function getEnergy($dbh, $prod)
    {
        $query = "SELECT energy FROM produit WHERE produit=?; ";
        $sth = $dbh->prepare($query);
        $sth->execute([$prod]);
        $result = $sth->fetchAll(PDO::FETCH_COLUMN);
        return $result[0];
    }


    public static function getIfProgNameExists($dbh, $name) //cherche si le nom d'un programme est deja pris
    {
        $query = "SELECT * FROM programs WHERE name=?";
        $sth = $dbh->prepare($query);
        $sth->execute([$name]);
        $result = $sth->fetchAll(PDO::FETCH_COLUMN);
        $np = count($result);
        if ($np == 0) {
            return false;
        } else {
            return true;
        }
    }
    public static function getProgIdByName($dbh, $name)
    {
        $query = "SELECT id FROM programs WHERE name=?; ";
        $sth = $dbh->prepare($query);
        $sth->execute([$name]);
        $result = $sth->fetchAll(PDO::FETCH_COLUMN);
        return $result[0];
    }
    public static function searchProgContByName($dbh, $name) //fais la recherche par nom de programme
    {
        $query = "SELECT id,name,login,creation,`imagesrc` FROM programs WHERE name LIKE ?; ";
        $sth = $dbh->prepare($query);
        $sth->execute(['%'.$name.'%']);
        $result = $sth->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    
    
    
    public static function getProgIdByLogin($dbh, $login) // donne les id des programmes d'un certain createur
    {
        $query = "SELECT id FROM programs WHERE login=?; ";
        $sth = $dbh->prepare($query);
        $sth->execute([$login]);
        $result = $sth->fetchAll(PDO::FETCH_COLUMN);
        return $result;
    }
    public static function searchProgContByLogin($dbh, $login) //fais la recherche par createur
    {
        $query = "SELECT id,name,login,creation,`imagesrc` FROM programs WHERE login LIKE ?; ";
        $sth = $dbh->prepare($query);
        $sth->execute(['%'.$login.'%']);
        $result = $sth->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    public static function getProgContByLogin($dbh, $login) // affiche les programmes d'un certain créateur
    {
        $query = "SELECT id,name,login,creation,`imagesrc` FROM programs WHERE login= ?; ";
        $sth = $dbh->prepare($query);
        $sth->execute([$login]);
        $result = $sth->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    public static function getContentByProgId($dbh, $id) //affiche les exos d'un programme
    {
        $query = "SELECT exo,descri,time,pause,ordre,id,`imagesrc` FROM prog_content WHERE prog=? ORDER BY ordre ASC; ";
        $sth = $dbh->prepare($query);
        $sth->execute([$id]);
        $result = $sth->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    public static function getMaxOrderByProgId($dbh, $id) //ordre maximum d'un exo dans un programme
    {
        $query = "SELECT MAX(ordre) FROM prog_content WHERE id=?; ";
        $sth = $dbh->prepare($query);
        $sth->execute([$id]);
        $result = $sth->fetchAll(PDO::FETCH_COLUMN);
        return $result[0];
    }


    public static function import($dbh, $login, $prog, $impo) //importer
    {
        $query = "INSERT INTO importation ( login, prog, impo) VALUES (?, ?,?);";
        $sth = $dbh->prepare($query);
        $sth->execute([$login, $prog, $impo]);
    }
    public static function getImported($dbh,$name)  //afficher les programmes importer
    {
        $query = "SELECT programs.id, programs.login, programs.name, programs.creation, programs.`imagesrc`, importation.impo FROM programs INNER JOIN importation ON importation.prog=programs.id WHERE importation.login=?; ";
        $sth = $dbh->prepare($query);
        $sth->execute([$name]);
        $result = $sth->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    public static function getLastContId($dbh){ //id du dernier exo
        $query = "SELECT MAX(id) FROM prog_content; ";
        $sth = $dbh->prepare($query);
        $sth->execute();
        $result = $sth->fetchAll(PDO::FETCH_COLUMN);
        return $result[0];
    }
    public static function getLastProgId($dbh){ //id du dernier programme
        $query = "SELECT MAX(id) FROM programs; ";
        $sth = $dbh->prepare($query);
        $sth->execute();
        $result = $sth->fetchAll(PDO::FETCH_COLUMN);
        return $result[0];
    }
    public static function editExo($dbh,$id,$exo,$descri,$time,$pause){ //modifie un exo
        $time0=intval($time);
        $pause0=intval($pause);
        $id0=intval($id);
        

        $query = 'UPDATE `prog_content` SET `exo`="'.$exo.'",`descri`="'. $descri.'",`time`=?,`pause`=? WHERE id=?';
        $sth = $dbh->prepare($query);
        $sth->execute([$time0,$pause0,$id0]);
    }
    public static function DeleteExo($dbh,$id){ //supprime un exo
        $id0=intval($id);
        $query = "DELETE FROM `prog_content` WHERE id=?";
        $sth = $dbh->prepare($query);
        $sth->execute([$id0]);
    }
    public static function CountExo($dbh,$prog){ //compte le nombre d'exo d'un programme
        $prog0=intval($prog);
        $query = "SELECT COUNT(*) FROM `prog_content` WHERE prog=?";
        $sth = $dbh->prepare($query);
        $sth->execute([$prog0]);
        $result=$sth->fetchAll(PDO::FETCH_COLUMN);
        return $result[0];
    }
    public static function afficheMessage($dbh,$moi,$lui){ //affiche les messages d'une conversation
        $query = "SELECT `message`,`exp` FROM `message` WHERE (`exp`=? AND `des`=? ) OR (`exp`=? AND `des`=? )";
        $sth = $dbh->prepare($query);
        $sth->execute([$moi,$lui,$lui,$moi]);
        $result=$sth->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    public static function envoyerMessage($dbh,$moi,$lui,$message){ //envoie un message
        $query = "INSERT INTO `message`(`exp`, `des`,`message`) VALUES (?, ?,?);";
        $sth = $dbh->prepare($query);
        $sth->execute([$moi,$lui,$message]);
    }
    public static function lu($dbh,$moi,$lui,$lu){ //change le statut d'une conversation en lu ou en non lu
        $query = 'UPDATE `correspondants` SET `lu`=? WHERE `num1`=? AND `num2`=?';
        $sth = $dbh->prepare($query);
        $sth->execute([$lu,$moi,$lui]);
    }
    public static function afficheCorres($dbh,$moi){ //affiche les personnes avec qui j'ai déjà parlé
        $query = "SELECT `num2`,`lu`,`message` FROM `correspondants`, `message` WHERE `num1`=? AND `id`=(SELECT MAX(id) FROM `message` WHERE (`exp`=? OR `des`=?))  ";
        $sth = $dbh->prepare($query);
        $sth->execute([$moi,$moi,$moi]);
        $result=$sth->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    public static function afficheMemeSalle($dbh,$moi){ //affiche les utilisateurs qui vont à la meme salle que moi
        $query = "SELECT `salle` FROM `salle` WHERE `login`=? ";
        $sth = $dbh->prepare($query);
        $sth->execute([$moi]);
        $f=$sth->fetchAll(PDO::FETCH_COLUMN);
        $salle=$f[0];
        $query = "SELECT `login` FROM `salle` WHERE `salle`=? AND `login`<>? ";
        $sth = $dbh->prepare($query);
        $sth->execute([$salle,$moi]);
        $result=$sth->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    public static function ajouteSalle($dbh,$moi,$salle){ //ajoute la salle d'un utilisateur
        $query2 = "DELETE FROM `salle` WHERE `login`=?;";
        $sth2 = $dbh->prepare($query2);
        $sth2->execute([$moi]);
        $query = "INSERT INTO `salle`(`login`, `salle`) VALUES (?, ?);";
        $sth = $dbh->prepare($query);
        $sth->execute([$moi,$salle]);
    }
    public static function newCorres($dbh,$moi,$lui){ //ajoute deux utilisateurs au tableau correspondant pour pouvoir savoir si ils ont lu les messages qu'ils s'envoient
        $query = "INSERT INTO `correspondants`(`num1`, `num2`) VALUES (?, ?);";
        $sth = $dbh->prepare($query);
        $sth->execute([$lui,$moi]);
        $query = "INSERT INTO `correspondants`(`num1`, `num2`) VALUES (?, ?);";
        $sth = $dbh->prepare($query);
        $sth->execute([$moi,$lui]);
    }
    public static function getIfCorres($dbh, $moi,$lui) //teste si deux utilisateurs ont déjà communiqués
    {
        $query = "SELECT * FROM `correspondants` WHERE `num1`=? AND `num2`=?";
        $sth = $dbh->prepare($query);
        $sth->execute([$moi,$lui]);
        $result = $sth->fetchAll(PDO::FETCH_COLUMN);
        $np = count($result);
        if ($np == 0) {
            return false;
        } else {
            return true;
        }
    }
    public static function CountNonLu($dbh,$moi){ //compte le nombre de mcontacts dont on n'a pas lu les messages
        $query = "SELECT COUNT(*) FROM `correspondants` WHERE `num1`=? AND `lu`='NON LU'  ";
        $sth = $dbh->prepare($query);
        $sth->execute([$moi]);
        $result = $sth->fetchAll(PDO::FETCH_COLUMN);
        return $result[0];
    }
    public static function ajouteCalendrier($dbh,$moi,$prog,$jour,$mois,$annee){ //ajoute le fait qu'il y a eu entrainement
        $query = "INSERT INTO `calendrier`(`login`, `prog`,`jour`,`mois`,`annee`) VALUES (?, ?, ?,?,?);";
        $sth = $dbh->prepare($query);
        $sth->execute([$moi,$prog,$jour,$mois,$annee]);
    }
    public static function afficheCalendrier($dbh,$moi,$mois,$annee){  //envoie les jours d'un mois où on s'est entraîné
        $query = "SELECT DISTINCT `jour` FROM `calendrier` WHERE `login`=? AND `mois`=? AND `annee`=? ORDER BY `jour`ASC";
        $sth = $dbh->prepare($query);
        $sth->execute([$moi,$mois,$annee]);
        $result=$sth->fetchAll(PDO::FETCH_COLUMN);
        return $result;
    }
    public static function afficheJour($dbh,$moi,$jour,$mois,$annee){  //affiche les programmes effectués pendant ce jour
        $query = "SELECT  pr.`name`, pr.`login` FROM `calendrier` AS cal INNER JOIN `programs` AS pr ON cal.`prog`=pr.`id` WHERE cal.`login`=? AND cal.`jour`=? AND cal.`mois`=? AND cal.`annee`=?";
        $sth = $dbh->prepare($query);
        $sth->execute([$moi,$jour,$mois,$annee]);
        $result=$sth->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    public static function ajouteImageExo($dbh,$id,$url){  //ajoute l'url d'une image pour un exo
        $query = "UPDATE `prog_content` SET `imagesrc`=? WHERE `id`=?";
        $sth = $dbh->prepare($query);
        $sth->execute([$url,intval($id)]);
        
    }
    public static function ajouteImageProg($dbh,$id,$url){    //ajoute l'url d'une image pour un programme
        $query = "UPDATE `programs` SET `imagesrc`=? WHERE `id`=?";
        $sth = $dbh->prepare($query);
        $sth->execute([$url,intval($id)]);


    }
    public static function remplaceImageExo($dbh,$id,$url){  //remplace l'ancienne image pour un exo et renvoie son url si il y en avait
        $query2 = "SELECT `imagesrc` FROM prog_content WHERE `id`=?; ";
        $sth2 = $dbh->prepare($query2);
        $sth2->execute([$id]);
        $result = $sth2->fetchAll(PDO::FETCH_COLUMN);
        $query = "UPDATE `prog_content` SET `imagesrc`=? WHERE `id`=?";
        $sth = $dbh->prepare($query);
        $sth->execute([$url,intval($id)]);
        if ($result != [""]){
            return $result[0];
        }
        else {
            return 'rien';
        }
    }
        public static function ImageExo($dbh,$id){  //image pour un exo 
            $query2 = "SELECT `imagesrc` FROM prog_content WHERE `id`=?; ";
            $sth2 = $dbh->prepare($query2);
            $sth2->execute([$id]);
            $result = $sth2->fetchAll(PDO::FETCH_COLUMN);
            if ($result != [""]){
                return $result[0];
            }
            else {
                return 'rien';
            }

    }
  

    

    



}
