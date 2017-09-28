<?php

class Router {
  function __construct() {
    $this->declare(include_once(__dir__.'/routes.php'));
  }
  public function declare ($routes) {
    $this->$routes = $routes;
  }
  public function match ($url, $method) {
    $method = strtolower($method);
    if (isset($this->$routes, $method)) {
      $routes = $this->$routes[$method];
      foreach ($routes as $route) {
        $mat = $this->matchRoute($route, $url);
        if ($mat) {
          var_dump($mat);
        }
      }
    }
  }
  private function matchRoute ($route, $url) {
    if ($route->path == $url) {
      return $route;
    }
  }
  private $routes = array();
}

$router = new Router();
$router->match('/', 'get');
