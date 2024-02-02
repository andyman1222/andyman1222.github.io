<?php
require_once 'packages/google-api-php-client-2.1.0/vendor/autoload.php';
class GoogleHandler{
      var $gClient;
      var $tokenFile;
      public function __construct($scope, $server, $redirectURI){
            global $gClient, $tokenFile;
            $gClient = new Google_Client();
            $tokenFile = fopen("secret/token.json", "w");
            if($server){
                  putenv('GOOGLE_APPLICATION_CREDENTIALS=secret/QuantumServer-201ab9dc117e.json');
                  $gClient->useApplicationDefaultCredentials();
            }
            $gClient->setAccessType("offline");
            $gClient->setAuthConfig('secret/client_secret_850373061539-jill6m3e555ls2gvovbf8lk92ie0fvo2.apps.googleusercontent.com.json');
            $gClient->addScope($scope);
            $gClient->setRedirectUri($redirectURI);
            
            
      }
      public function getClient(){
            return $this->$gClient;
      }

      public function getToken(){
            global $tokenFile;
            return $tokenFile['token'];
      }

      public function authenticate(){
            global $gClient, $tokenFile;
            $auth_url = $gClient->createAuthUrl();
            header('Location: ' . filter_var($auth_url, FILTER_SANITIZE_URL));
            $token=null;
            if(filesize("Csecret/token.json") > 0 && fread($tokenFile, filesize("secret/token.json"))!=null){
                  $token = json_decode($tokenFile);
                  $this->$gClient->setAccessToken($token['token']);
                  if($this->$gClient->isAccessTokenExpired()){
                        $this->$gClient->refreshToken($token['refresh_token']);
                        $token = $this->$gClient->getAccessToken();
                        fwrite($tokenFile, json_encode($token));
                  }
            }
            else{
                 if (isset($_GET['code'])) {
                  $token = $gClient->fetchAccessTokenWithAuthCode($_GET['code']);
                  fwrite($tokenFile, json_encode($token));
                  }
            }
            $gClient->setAccessToken($token);
            foreach($token as $item){
                  echo($item . "/n/n ");
            }
      }
      
}

//$test = new GoogleHandler("https://picasaweb.google.com/data/");

?>