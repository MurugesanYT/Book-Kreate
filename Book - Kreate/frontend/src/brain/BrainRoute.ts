import {
  CheckHealthData,
  GenerateBookPlanData,
  GenerateBookPlanRequest,
  GenerateChapterData,
  GenerateChapterRequest,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * No description
   * @tags dbtn/module:book_generation, dbtn/hasAuth
   * @name generate_book_plan
   * @summary Generate Book Plan
   * @request POST:/routes/generate-book-plan
   */
  export namespace generate_book_plan {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GenerateBookPlanRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateBookPlanData;
  }

  /**
   * No description
   * @tags dbtn/module:book_generation, dbtn/hasAuth
   * @name generate_chapter
   * @summary Generate Chapter
   * @request POST:/routes/generate-chapter
   */
  export namespace generate_chapter {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GenerateChapterRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateChapterData;
  }
}
