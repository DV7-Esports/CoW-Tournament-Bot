import {Message} from 'discord.js';
import { IQuestion } from './interfaces';

export default {
    questionnaire: async (dmMessage: Message, questions: IQuestion[], defaultAnswers?: string[]): Promise<string[]> => {
        let answers: string[] = [];
        for (let i = 0 ; i < questions.length ; i += 1) {
            if (questions[i].options?.default === true && defaultAnswers && defaultAnswers[i]) {
                dmMessage.channel.send(questions[i].question + '\n _Your last answer: ' + defaultAnswers[i] + '._');
            }
            else {
                dmMessage.channel.send(questions[i].question);
            }
            const question = Object.assign({}, questions[i]);
            if (question.options !== undefined && question.options.noanswer) 
                continue;
            try {
                const answerObj = (await dmMessage.channel.awaitMessages({ filter: (message: Message) => message.author.id !== dmMessage.author.id, max: 1, time: 90_000, errors: ['time'] }))
                                    .map((value) => value);
                const answer = answerObj[0];
                if (question.options !== undefined && question.options.optional && answer?.content === 'stop') {
                    break;
                }
                answers.push(answer?.content as string);
            } catch (err: any) {
                await dmMessage.channel.send('Your application timed out. You have 90s per question to answer. Try again.');
                return []; 
            }
        }
        return answers;
    }
};