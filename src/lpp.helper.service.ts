import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class LppHelper {
  transpose(problem) {
    problem[0].push(1);
    problem.push(problem.shift());
    const transpose = problem[0].map((col, c) =>
      problem.map((row, r) => problem[r][c])
    );
    transpose[transpose.length - 1].pop();
    return transpose;
  }

  addConstrains(missingConstrains, problem) {
    for (let i = 0; i < missingConstrains; i++) {
      problem.push(problem[1]);
    }
    return problem;
  }

  addSlackVariables(problem: number[][]) {
    for (let i = 0; i < problem[problem.length - 1].length; i++) {
      problem[problem.length - 1][i] = -problem[problem.length - 1][i];
    }
    problem[problem.length - 1].push(0);
    let position = 0;
    for (let i = 0; i < problem.length; i++) {
      const tmp = problem[i].pop();
      const length = problem[i].length;
      for (let j = 0; j <= length; j++) {
        if (position == j) {
          problem[i].push(1);
        } else {
          problem[i].push(0);
        }
      }
      position++;
      problem[i].push(tmp);
    }

    return problem;
  }

  calculateMatrix(problem: number[][], pivot: { r: number; c: number }) {
    const result = [];
    for (let i = 0; i < problem[pivot.r].length; i++) {
      result.push(problem[pivot.r][i] / problem[pivot.r][pivot.c]);
    }
    problem[pivot.r] = result;
    for (let i = 0; i < problem.length; i++) {
      const result = [];
      for (let j = 0; j < problem[0].length; j++) {
        let val;
        if (i != pivot.r) {
          val = -problem[i][pivot.c];
          result.push(problem[i][j] + val * problem[pivot.r][j]);
        }
      }
      if (i != pivot.r) {
        problem[i] = result;
      }
    }
    return problem;
  }

  calculate(problem: number[][], name: string, startDate: Date) {
    name = name.replace('.txt', '');

    //Check if the problem is solved
    if (this.isSolved(problem)) {
      //Save the final result in a file
      let counter = 0;
      let result = 'Result for ' + name + '\n';
      for (let i = 0; i < problem[problem.length - 1].length; i++) {
        if (
          i >= problem[problem.length - 1].length / 2 - 1 &&
          i !== problem[problem.length - 1].length - 2
        ) {
          if (i === problem[problem.length - 1].length - 1) {
            result =
              result + 'r' + ': ' + problem[problem.length - 1][i] + '\n';
          } else {
            result =
              result +
              'x' +
              counter +
              ': ' +
              problem[problem.length - 1][i] +
              '\n';
          }
          counter++;
        }
      }
      fs.writeFileSync('./result/' + name + 'result.txt', result);
      console.log('-------------------------------\n');
      console.log(result);
      const time = new Date().getMilliseconds() - startDate.getMilliseconds();
      console.log('time to solve the problem: ' + time + 'ms');
      console.log('-------------------------------\n');
      return true;
    } else {
      const startDate = new Date();

      //find position of the Pivot element
      const pivot = this.findPivot(problem);

      //calculation steps for the matrix
      problem = this.calculateMatrix(problem, pivot);

      //repeat the last steps until the problem is solved
      this.calculate(problem, name, startDate);
    }
  }

  findPivot(problem: number[][]) {
    let column;
    let val;
    for (let i = 0; i < problem[problem.length - 1].length; i++) {
      if (problem[problem.length - 1][i] < val || val == undefined) {
        val = problem[problem.length - 1][i];
        column = i;
      }
    }
    let row;
    let result;
    for (let i = 0; i < problem.length - 1; i++) {
      if (problem[i][problem[i].length - 1] / problem[i][column] > 0) {
        if (
          problem[i][problem[i].length - 1] / problem[i][column] < result ||
          result == undefined
        ) {
          row = i;
          result = problem[i][problem[i].length - 1] / problem[i][column];
        }
      }
    }
    return { r: row, c: column };
  }

  isSolved(problem: number[][]) {
    for (let i = 0; i < problem[problem.length - 1].length; i++) {
      if (problem[problem.length - 1][i] < 0) {
        return false;
      }
    }
    return true;
  }
}
