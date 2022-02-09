import { PermissionString } from 'discord.js';

/**
 * Config interface for client.
 */
export interface IConfig {
    /** Token of the client */
    token: string;

    /** Prefix of the client */
    prefix: string;

    /** Developer ids of the client */
    developers: string[];

    /**
     * Status of sending error message when user try to run unknown command.
     */
    unknownErrorMessage: boolean;
}

/**
 * Information interface for questions.
 */
 export interface IQuestionOptions {
    
    /**
     * If the question is optional (optional = true), by typing 'stop' you can finalize answering the questions.
     */
     optional?: boolean;
    
    /**
     * If the question not expected to be answered or is not a question at all, set noanswer to true.
     */
    noanswer?: boolean;
        
    /**
     * General format of the answer to the question.
     */
    answerRegex?: string;

    /**
     * Sets default answer.
     */
    default?: boolean;
}

/**
 * Information interface for options for questions.
 */
 export interface IQuestion {
     
    /**
     * The messege that's gonna be sent.
     */
    question: string;
    
    /**
     * Custom options for this question.
     */
    options?: IQuestionOptions;
}

/**
 * Information interface for commands.
 */
export interface ICommandInfo {
    /** Name of the command */
    name: string;

    /** Group name of the command */
    group: string;

    /** Aliases of the command */
    aliases?: string[];

    /** Example usages */
    examples?: string[];

    /** Description of the command */
    description?: string;

    /** Questions in order to collect the command parameters */
    questions?: IQuestion[];

    /**
     * Time to wait for each use (seconds)
     *
     * Developers are not affected
     */
    cooldown?: number;

    /** Status of the command */
    enabled?: boolean;

    /**
     * If enabled, command only runs in nsfw channels
     *
     * Developers are not affected
     */
    onlyNsfw?: boolean;

    /** Requirements of the command */
    require?: ICommandRequire;
}

/**
 * Requirement interface for commands.
 */
export interface ICommandRequire {
    /** If enabled, command requires developer permission to run */
    developer?: boolean;

    /**
     * Command requires permission flags to run
     *
     * Developers are not affected
     */
    permissions?: PermissionString[];

    /**
     * Command requires permission flags to run
     *
     * Developers are not affected
     */
    roles?: string[];
}
