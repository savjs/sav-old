<?php

class Router {
  function __construct ($options = null) {
    if (is_array($options)) {
      $this->options = array_merge($this->options, $options);
    }
    $this->declare(include_once(__dir__.'/routes.php'));
  }
  public function declare ($routes) {
    $this->routes = $routes;
  }
  public function match ($url, $method) {
    if ($this->options['baseUrl']) {
      $baseUrl = $this->options['baseUrl'];
      if (strpos($baseUrl, $url) == 0) {
        $url = substr($url, count($baseUrl));
      } else {
        return ;
      }
    }
    $method = strtoupper($method);
    return $this->matchUrl($url, $method);
  }
  private function matchUrl ($url, $method) {
    // 根级路由
    $isOptions = $method == 'options';
    if ($isOptions) {
      foreach ($this->routes as $key => $routes) {
        if ($key == 'GROUPS') {
          continue;
        }
        $mat = $this->matchRoutes($routes, $url);
        if ($mat) {
          return $mat;
        }
      }
    } else if (isset($this->routes[$method])) {
      $mat = $this->matchRoutes($this->routes[$method], $url);
      if ($mat) {
        return $mat;
      }
    }
    // 分组路由
    if (isset($this->routes['GROUPS'])) {
      $target = null;
      foreach ($this->routes['GROUPS'] as $route) {
        $mat = $this->matchUriRegExp($route, $url, true);
        if ($mat) {
          if ($target) {// 不是根级 结束匹配
            $target = $mat;
            break;
          }
          if (isset($route['uri']) && ($route['uri'] == '/')) {
            $target = $mat; // 如果是根级 则继续匹配
          }
        }
      }
      if ($target) {
        // 需要把模块加载进来做action的路由匹配
        $modalName = $target[0]['name'];
        $routes = $this->getModal($modalName)['routes'];
        foreach ($routes as $methodName => $route) {
          if ($isOptions || ($route['method'] == $method)) {
            $mat = $this->matchUriRegExp($route, $url);
            if ($mat) {
              list ($route, $params) = $mat;
              $route['modalName'] = $modalName;
              $route['methodName'] = $methodName;
              return array($route, $params);
            }
          }
        }
      }
      // 没有匹配到
    }
  }
  private function matchRoutes ($routes, $url) {
    foreach ($routes as $child) {
      $mat = $this->matchUriRegExp($child, $url);
      if ($mat) {
        list (, $params) = $mat;
        list ($modalName, $methodName) = explode('.', $child['name']);
        $route = $this->getModal($modalName)['routes'][$methodName];
        $route['modalName'] = $modalName;
        $route['methodName'] = $methodName;
        return array($route, $params);
      }
    }
  }
  private function matchUriRegExp ($route, $url, $matchPrefix = false) {
    if (isset($route['uri'])) {
      if ($matchPrefix) {
        if (strpos($route['uri'], $url) == 0) {
          return array($route, array());
        }
      } else {
        if ($route['uri'] == $url) {
          return array($route, array());
        }
      }
    }
    if (isset($route['regexp'])) {
      if (FALSE != preg_match_all($route['regexp'], $url, $matches)) {
        if (count($matches) == 0) {
          return array($route, array());
        } else {
          array_shift($matches);
          $keys = explode(',', isset($route['keys']) ? $route['keys'] : '');
          if (count($matches) <= count($keys)) {
            $mat = array();
            foreach($matches as $index => $val) {
              $mat[$keys[$index]] = $val[0];
            }
            return array($route, $mat);
          }
          return array($route, array()); 
        }
      }
    }
  }
  private function getModal ($name) {
    if (!isset($this->modals[$name])) {
      $this->modals[$name] = include_once(
        $this->options['root'] . '/modals/' . $name . '.php'
      );
    }
    return $this->modals[$name];
  }
  private $routes = array();
  private $modals = array();
  private $options = array(
    'root' => __dir__ , // 根目录
    'baseUrl' => '',    // 基础URL
  );
}

$router = new Router();
var_dump($router->match('/', 'get'));
var_dump($router->match('/articles/123', 'get'));
var_dump($router->match('/about', 'get'));
