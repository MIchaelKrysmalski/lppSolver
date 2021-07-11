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
            console.log(missingConstrains);
            problem = this.addConstrains(missingConstrains, problem);
          }
          for (let i = 0; i < problem.length; i++) {
            console.log(problem[i]);
          }
        });
      });
    });
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
    for (let i = 0; i < transpose.length; i++) {
      console.log(transpose[i]);
    }
  }
}
