package main

import (
	"errors"
	"fmt"
)

func divide(num1 float64, num2 float64) (float64, error) {
	if num2 == 0.0 {
		return 0, errors.New("Division by zero")
	}

	return num1 / num2, nil
}

func main() {
	num1 := 64.0
	num2 := 3.0

	quotient, err := divide(num1, num2)
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	fmt.Println(num1, "/", num2, "=", quotient)

	num1 = 48.0
	num2 = 0.0

	quotient, err = divide(num1, num2)
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	fmt.Println(num1, "/", num2, "=", quotient)
}
