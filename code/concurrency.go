package main

import (
	"fmt"
	"math"
)

func squares(stopAt float64, ch chan float64) {
	for i := 1.0; i <= stopAt; i++ {
		ch <- math.Pow(i, 2)
	}
	close(ch)
}

func roots(stopAt float64, ch chan float64) {
	for i := 1.0; i <= stopAt; i++ {
		ch <- math.Pow(i, 0.5)
	}
	close(ch)
}

func main() {
	squaresCh := make(chan float64)
	rootsCh := make(chan float64)

	go squares(10, squaresCh)
	go roots(10, rootsCh)

	for squaresCh != nil || rootsCh != nil {
		select {
		case value, ok := <-squaresCh:
			if !ok {
				squaresCh = nil
			} else {
				fmt.Println("Square:", value)
			}
		case value, ok := <-rootsCh:
			if !ok {
				rootsCh = nil
			} else {
				fmt.Println("Root:", value)
			}
		}
	}
}
