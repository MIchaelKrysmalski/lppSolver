import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as fs from 'fs';
import { LppHelper } from './lpp.helper.service';

@Injectable()
export class LppService {
  constructor(private lppHelper: LppHelper) {}
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
            problem = this.lppHelper.addConstrains(missingConstrains, problem);
          }

          //Transpose the problem to generate a max problem
          let transposedProblem = [];
          transposedProblem = this.lppHelper.transpose(problem);

          //Add Slack Variables to be able to solve the problem
          const maxProblem =
            this.lppHelper.addSlackVariables(transposedProblem);

          //final steps to calculate the result of the problem
          this.lppHelper.calculate(maxProblem, file, null);
        });
      });
    });
  }
}
