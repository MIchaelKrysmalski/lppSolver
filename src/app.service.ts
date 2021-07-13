/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { count } from 'console';
import * as fs from 'fs';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  @Cron('* * * * *')
  solveProblem() {
    fs.readdir('./files', (error, files) => {
      files.forEach((file) => {
        fs.readFile('./files/' + file, 'utf-8', (error, data) => {
          if (error) {
            console.log(error);
            return;
          }
          //Prepare to read data from the file
          for (let i = 0; i < data.length; i++) {
            data = data.replace(' + ', ' ');
            data = data.replace(' >= ', ' ');
            data = data.replace('*', '');
            data = data.replace(';', '');
          }
          data = data.replace('min:', '');
          
          //read data from prpared file in an Array
          const lines = data.split(/\r?\n/);
          lines.splice(0, 1);
          lines.splice(1, 1);
          for (let i = 0; i < lines.length; i++) {
            for (let j = 0; j < lines[i].length; j++) {
              lines[i] = lines[i].replace('x' + j, '');
            }
          }

          let problem = [];
          for (let i = 0; i < lines.length; i++) {
            problem[i] = lines[i].split(' ').map(Number);
            problem[i].shift();
            
            if (problem[i].length == 0) {
              problem.splice(i, 1);
            }
          }

          //Check how many constrains are included in the problem
          if (problem[0].length > problem.length - 1) {
            const missingConstrains = problem[0].length - (problem.length - 1);
            problem = this.addConstrains(missingConstrains, problem);
          }

          //Transpose the problem to generate a max problem
          let transposedProblem = [];
          transposedProblem = this.transpose(problem);

          //Add Slack Variables to be able to solve the problem
          const maxProblem = this.addSlackVariables(transposedProblem);

          //final steps to calculate the result of the problem
          this.calculate(maxProblem,file);

        });
      });
    });
  }
  calculate(problem: number[][], name: string) {
    
    name = name.replace('.txt', '');
    
    //Check if the problem is solved
    if (this.isSolved(problem)) {
      
      //Save the final result in a file
      let counter = 0;
      let result = 'Result for '+ name+ '\n';
      for (let i = 0; i < problem[problem.length - 1].length; i++) {
        if (i >= problem[problem.length - 1].length / 2 - 1 && i !== problem[problem.length - 1].length - 2) {
          if (i === problem[problem.length - 1].length - 1) {
            result = result + "r" + ": " + problem[problem.length - 1][i]+ '\n';
          } else {
            result = result + "x" + counter + ": " + problem[problem.length - 1][i] + '\n';
          }
          counter++;
        }
      }
      fs.writeFileSync('./result/'+ name +'result.txt', result);
      console.log(result);
      return true;
    } else {

      //find position of the Pivot element
      const pivot = this.findPivot(problem);

      //calculation steps for the matrix
      problem = this.calculateMatrix(problem, pivot);
      
      //repeat the last steps until the problem is solved
      this.calculate(problem,name);
    }
    //Here happens the magic!
  }
  calculateMatrix(problem: number[][], pivot: { r: number, c: number }) {
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
  isSolved(problem: number[][]) {
    for (let i = 0; i < problem[problem.length - 1].length; i++) {
      if (problem[problem.length - 1][i] < 0) {
        return false;
      }
    }
    return true;
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
        if (problem[i][problem[i].length - 1] / problem[i][column] < result || result == undefined) {
          row = i;
          result = problem[i][problem[i].length - 1] / problem[i][column]
        }
      }
    }
    return { r: row, c: column };
  }
  addSlackVariables(problem: number[][]) {
    for (let i = 0; i < problem[problem.length - 1].length; i++) {
      problem[problem.length - 1][i] = - (problem[problem.length - 1][i]);
    }
    problem[problem.length - 1].push(0);
    let position = 0;
    for (let i = 0; i < problem.length; i++) {
      const tmp = problem[i].pop();
      const length = problem[i].length
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

    return problem
  }
  addConstrains(missingConstrains, problem) {
    for (let i = 0; i < missingConstrains; i++) {
      problem.push(problem[1]);
    }
    return problem;
  }
  transpose(problem) {
    problem[0].push(1);
    problem.push(problem.shift());
    const transpose = problem[0].map((col, c) =>
      problem.map((row, r) => problem[r][c]),
    );
    transpose[transpose.length - 1].pop();
    return transpose;
  }
}
