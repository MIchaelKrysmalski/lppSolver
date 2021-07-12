/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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
          for (let i = 0; i < data.length; i++) {
            data = data.replace(' + ', ' ');
            data = data.replace(' >= ', ' ');
            data = data.replace('*', '');
            data = data.replace(';', '');
          }
          data = data.replace('min:', '');
          const lines = data.split(/\r?\n/);
          lines.splice(0, 1);
          lines.splice(1, 1);
          console.log(data);
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
          if (problem[0].length > problem.length - 1) {
            console.log('constrains: ' + (problem.length - 1));
            console.log('variables: ' + problem[0].length);
            const missingConstrains = problem[0].length - (problem.length - 1);
            problem = this.addConstrains(missingConstrains, problem);
          }
          console.log("Min:");
          for (let i = 0; i < problem.length; i++) {

            console.log(problem[i]);
          }
          let transposedProblem = [];
          console.log("Transpose: ")
          transposedProblem = this.transpose(problem);


          //prepare for last steps //
          //selbsaufrufende funktion -> pivot = 1 -> rest = 0
          //find pivot() returns { r, c}
          //checkfinished() return true
          const maxProblem = this.addSlackVariables(transposedProblem);
          console.log("Added Slack Variables to Matrix:");
          for (let i = 0; i < maxProblem.length; i++) {

            console.log(maxProblem[i]);
          }

          this.calculate(maxProblem);

        });
      });
    });
  }
  calculate(problem: number[][]) {
    if (this.isSolved(problem)) {
      console.log("result: ")
      for (let i = 0; i < problem[problem.length - 1].length; i++) {
        console.log("x" + i + " " + "=" + problem[problem.length - 1][i]);
      }
      return true;
    } else {
      const pivot = this.findPivot(problem);
      problem = this.calculateMatrix(problem, pivot);
      console.log(problem)
    }
    //Here happens the magic!
  }
  calculateMatrix(problem: number[][], pivot: { r: number, c: number }) {
    const result = [];
    for (let i = 0; i < problem[pivot.r].length; i++) {
      result.push(problem[pivot.r][i] / problem[pivot.r][pivot.c]);
    }
    problem[pivot.r] = result;
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
    console.log("Pivot Position: ")
    console.log({ r: row, c: column });
    return { r: row, c: column };
  }
  addSlackVariables(problem: number[][]) {
    for (let i = 0; i < problem[problem.length - 1].length; i++) {
      problem[problem.length - 1][i] = - (problem[problem.length - 1][i]);
    }
    problem[problem.length - 1].push(0);
    for (let i = 0; i < problem.length; i++) {
      console.log(problem[i]);
    }
    let position = 0;
    for (let i = 0; i < problem.length; i++) {
      let tmp = problem[i].pop();
      let length = problem[i].length
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
    //prepare objective fcn
    //add slack variables here!

    return problem
  }
  addConstrains(missingConstrains, problem) {
    console.log(missingConstrains);
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
