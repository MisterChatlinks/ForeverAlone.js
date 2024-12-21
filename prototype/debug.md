### 1. **`error`** (Red, high visibility)
   - **When to use**: For critical issues that prevent the application from functioning correctly. These are situations where the system has encountered a major problem that needs immediate attention (e.g., exceptions, failed network requests).
   - **Example**: A database connection failure, or an uncaught exception.

### 2. **`warn`** (Yellow, attention-grabbing)
   - **When to use**: For situations that are not critical but still potentially problematic or something to keep an eye on. These might indicate things that could lead to issues if not addressed (e.g., deprecated API usage, potential misconfigurations).
   - **Example**: Deprecation warnings, falling back to default configurations when user settings are missing.

### 3. **`info`** (Blue, informational)
   - **When to use**: For general informational messages that provide insight into the normal operation of the application. Use this level for logs that communicate the state of the system or operations that are part of the expected process.
   - **Example**: Successful completion of a task, like loading data, or an API request that completed successfully.

### 4. **`debug`** (Orange, development-focused)
   - **When to use**: For debugging and tracing. These logs are meant for developers to understand what’s happening under the hood during development or when debugging an issue. They often include detailed internal state information and variable values.
   - **Example**: Tracking the values of variables during an algorithm, or logging function calls and their arguments to debug code.

### 5. **`success`** (Green, success or positive action)
   - **When to use**: For indicating successful operations or completion of tasks that are part of the desired outcome. You can use this to indicate milestones or successful actions.
   - **Example**: A successful login, a successful API call, or a completed form submission.

### 6. **`log`** (Basic log, typically neutral)
   - **When to use**: For general-purpose logging that doesn't fall under any specific log level. This can be used for any generic information that doesn’t specifically indicate an error, warning, or info.
   - **Example**: Debugging or logging an event for the sake of traceability without categorizing it into one of the other levels.

### Summary:
- **Error**: Critical issues that require attention.
- **Warn**: Potential issues or non-ideal situations.
- **Info**: General operational messages.
- **Debug**: Development-focused information for troubleshooting.
- **Success**: Positive or completed actions.
- **Log**: General-purpose logging without strong meaning.

When you're building your app, think about **who will see the logs** (e.g., developers, end-users, or administrators) and the **severity of the message** to decide which log level is most appropriate.