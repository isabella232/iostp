<?php
class db extends mysqli {
    public function prepare($query) {
        return new stmt($this,$query);
    }
}

class stmt extends mysqli_stmt {
    public function __construct($link, $query) {
        $this->mbind_reset();
        parent::__construct($link, $query);
    }

    public function mbind_reset() {
        unset($this->mbind_params);
        unset($this->mbind_types);
        $this->mbind_params = [];
        $this->mbind_types  = [];
    }

    //use this one to bind params by reference
    public function mbind_param($type, &$param) {
        $this->mbind_types[]  = $type;
        $this->mbind_params[] = &$param;
    }

    //use this one to bin value directly, can be mixed with mbind_param()
    public function mbind_value($type, $param) {
        $this->mbind_types[]  = $type;
        $this->mbind_params[] = $param;
    }


    public function mbind_param_do() {
        $params = array_merge(array(join("",$this->mbind_types)), $this->mbind_params);
        return call_user_func_array(array($this, 'bind_param'), $this->makeValuesReferenced($params));
    }

    private function makeValuesReferenced($arr){
        $refs = [];
        foreach($arr as $a) {
            $refs[] = &$a;
        }
        return $refs;

    }

    public function execute() {
        if(count($this->mbind_params))
            $this->mbind_param_do();

        return parent::execute();
    }

    private $mbind_types  = [];
    private $mbind_params = [];
}
?>