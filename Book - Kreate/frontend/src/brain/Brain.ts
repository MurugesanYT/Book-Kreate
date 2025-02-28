import {
  CheckHealthData,
  GenerateBookPlanData,
  GenerateBookPlanError,
  GenerateBookPlanRequest,
  GenerateChapterData,
  GenerateChapterError,
  GenerateChapterRequest,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:book_generation, dbtn/hasAuth
   * @name generate_book_plan
   * @summary Generate Book Plan
   * @request POST:/routes/generate-book-plan
   */
  generate_book_plan = (data: GenerateBookPlanRequest, params: RequestParams = {}) =>
    this.request<GenerateBookPlanData, GenerateBookPlanError>({
      path: `/routes/generate-book-plan`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:book_generation, dbtn/hasAuth
   * @name generate_chapter
   * @summary Generate Chapter
   * @request POST:/routes/generate-chapter
   */
  generate_chapter = (data: GenerateChapterRequest, params: RequestParams = {}) =>
    this.request<GenerateChapterData, GenerateChapterError>({
      path: `/routes/generate-chapter`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
