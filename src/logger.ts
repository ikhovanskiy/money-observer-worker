class Logger {
  public static log(message: unknown) {
    console.log("\x1b[46m%s", "[log]\x1b[0m: ", message);
  }

  public static error(message: unknown) {
    console.error("\x1b[41m%s", "[error]\x1b[0m: ", message);
  }
}

export { Logger };
