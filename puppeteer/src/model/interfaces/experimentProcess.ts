import {UrlData} from "../urlData";
import {ExperimentResult} from "./experimentResult";

export interface ExperimentProcess<T extends ExperimentResult> {
    /**
     * Will return an Array of experiment results for each iteration of the
     * @param urlData
     * @param params
     */
    runExperiment(urlData: UrlData, params: any): Promise<Array<T>>;
}