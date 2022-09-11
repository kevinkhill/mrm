import type { CliArgs, MrmOptions, MrmTask, TaskRecords } from "../types/mrm";
export declare class TaskStore {
    preset: string;
    initialized: boolean;
    get PATH(): string[];
    get options(): Partial<MrmOptions>;
    get aliases(): TaskRecords;
    get isDefaultPreset(): boolean;
    static DEFAULT_DIRECTORIES: string[];
    private _argv;
    private _debug;
    private _directories;
    private _options;
    constructor(argv: CliArgs, options?: MrmOptions);
    initStore(directories?: string[]): Promise<void>;
    addDirToPath(dir: string): void;
    setOption(option: string, value: unknown): void;
    setOptions(options: Partial<MrmOptions>): void;
    mergeOptions(options: Partial<MrmOptions>): void;
    getAllTasks(): Promise<TaskRecords>;
    run(name: string | string[]): Promise<unknown>;
    runAlias(aliasName: string): Promise<unknown>;
    runTask(taskName: string): Promise<unknown>;
    getTaskOptions(task: MrmTask, interactive?: boolean): Promise<Partial<MrmOptions>>;
    queueTasks(task: string | string[]): void;
    runTaskQueue(): Promise<void>;
    private resolveTask;
}
