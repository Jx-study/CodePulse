export class EloService {
  private static K_FACTOR = 32; // K值，決定分數變動幅度，可根據用戶等級動態調整

  /**
   * 計算預期勝率 (Expected Score)
   * 公式: E_a = 1 / (1 + 10 ^ ((R_b - R_a) / 400))
   * @param userRating 用戶當前分數
   * @param questionRating 題目難度分數
   */
  static getExpectedScore(userRating: number, questionRating: number): number {
    return 1 / (1 + Math.pow(10, (questionRating - userRating) / 400));
  }

  /**
   * 計算新分數
   * @param userRating 用戶當前分數
   * @param questionRating 題目難度分數
   * @param actualScore 實際得分 (1=答對, 0=答錯, 0.5=部分答對)
   */
  static calculateNewRating(
    userRating: number,
    questionRating: number,
    actualScore: number,
  ): number {
    const expectedScore = this.getExpectedScore(userRating, questionRating);
    const newRating =
      userRating + this.K_FACTOR * (actualScore - expectedScore);
    return Math.round(newRating);
  }

  /**
   * 將 1-3 的難度等級轉換為初始 Elo 分數
   */
  static difficultyToElo(difficulty: 1 | 2 | 3): number {
    switch (difficulty) {
      case 1:
        return 800; // 簡單
      case 2:
        return 1000; // 中等
      case 3:
        return 1200; // 困難
      default:
        return 1000;
    }
  }
}
