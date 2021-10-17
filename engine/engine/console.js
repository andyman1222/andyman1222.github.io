/**DO NOT USE console.log() OR THERE WILL BE POTENTIAL LOCKUP!
 * Instead use this function
 */

function bufferedConsoleLog(s) {
	if (consoleBufferLock)
		setTimeout(bufferedConsoleLog, 10, s)
	else
		if (consoleBuffer.length < maxConsoleBuffer)
			switch (typeof s) {
				case "object": case "function": case "symbol": case "bigint":
					consoleBuffer.push(s.valueOf())
					break
				default:
					consoleBuffer.push(s)
			}
		else removedMessages++

}