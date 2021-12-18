### 使用方式

    此為NextJS+Draftjs專案範本，以NextJS+TailwindCSS完成基礎設定

    ```
    npm ci


    npm run  dev
    ```

## DraftJS Editor
[線上Demo](https://draftjs-example.netlify.app/)

[DraftJS](https://draftjs.org/)


編輯器使用`DraftJS`進行撰寫，目前已完成功能有：

## 左側功能列：

-   選取內文標題更改時，自動重置所有已設 inline style
-   不同標題限制 style 使用
-   內文`H2`大標
-   `H3`小標
-   `blockquote` 引言
-   數字列表、無數字列表
-   圖片插入：採 URL 插入
-   客製區塊插入(實驗)

## 反白功能列(控制所選文字)：

-   粗體
-   斜體
-   底線
-   `Code`
-   刪除線
-   超連結

反白功能列依照所屬區塊進行限制
