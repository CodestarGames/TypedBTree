import {Signal} from "../signals/Signal";

export class SignalSingleton {


    private static instance: SignalSingleton;
    onOpenTree: Signal;
    onSetScheme: Signal;
    onSetTree: Signal;

    private constructor() {
        this.onOpenTree = new Signal();
        this.onSetScheme = new Signal();
        this.onSetTree = new Signal();
    }

    public static getInstance(): SignalSingleton {
        if (!SignalSingleton.instance) {
            SignalSingleton.instance = new SignalSingleton();
        }

        return SignalSingleton.instance;
    }
}