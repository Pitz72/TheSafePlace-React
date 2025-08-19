/**
 * Test System for Narrative Messages
 * The Safe Place - v0.4.1 Message System Validation
 */

import { MessageType, getRandomMessage, MESSAGE_ARCHIVE } from '../data/MessageArchive';

export interface MessageTestResult {
  messageType: MessageType;
  success: boolean;
  message?: string;
  error?: string;
}

export class MessageSystemTester {
  /**
   * Test all message types to ensure no "messaggio non disponibile"
   */
  static testAllMessageTypes(): MessageTestResult[] {
    const results: MessageTestResult[] = [];
    
    // Test all enum values
    Object.values(MessageType).forEach(messageType => {
      try {
        // Test without context
        const message1 = getRandomMessage(messageType);
        const success1 = !message1.includes('non disponibile') && !message1.includes('Messaggio non disponibile');
        
        results.push({
          messageType,
          success: success1,
          message: message1,
          error: success1 ? undefined : 'Returns "messaggio non disponibile"'
        });

        // Test with biome context for BIOME_ENTER
        if (messageType === MessageType.BIOME_ENTER) {
          const biomes = ['F', '.', 'C', 'V', 'S', 'E', 'R', 'M', '~', 'X']; // X is unmapped
          
          biomes.forEach(biome => {
            const message2 = getRandomMessage(messageType, { biome });
            const success2 = !message2.includes('non disponibile') && !message2.includes('Messaggio non disponibile');
            
            results.push({
              messageType: `${messageType}_${biome}` as MessageType,
              success: success2,
              message: message2,
              error: success2 ? undefined : `Biome '${biome}' returns "messaggio non disponibile"`
            });
          });
        }

      } catch (error) {
        results.push({
          messageType,
          success: false,
          error: `Exception: ${error}`
        });
      }
    });

    return results;
  }

  /**
   * Run comprehensive test and generate report
   */
  static runComprehensiveTest(): {
    totalTests: number;
    passed: number;
    failed: number;
    successRate: number;
    failures: MessageTestResult[];
    summary: string;
  } {
    console.log('🧪 Running comprehensive message system test...');
    
    const results = this.testAllMessageTypes();
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const failures = results.filter(r => !r.success);
    const successRate = Math.round((passed / results.length) * 100);

    const summary = `
📊 MESSAGE SYSTEM TEST RESULTS
==============================
Total Tests: ${results.length}
Passed: ${passed} ✅
Failed: ${failed} ${failed > 0 ? '❌' : '✅'}
Success Rate: ${successRate}%

${failed > 0 ? '❌ FAILURES FOUND:' : '✅ ALL TESTS PASSED!'}
${failures.map(f => `- ${f.messageType}: ${f.error}`).join('\n')}

${successRate >= 95 ? '🎉 Message system is robust and ready!' : '⚠️ Message system needs attention.'}
    `.trim();

    console.log(summary);

    return {
      totalTests: results.length,
      passed,
      failed,
      successRate,
      failures,
      summary
    };
  }

  /**
   * Test specific message type with context
   */
  static testMessageType(type: MessageType, context?: Record<string, any>): MessageTestResult {
    try {
      const message = getRandomMessage(type, context);
      const success = !message.includes('non disponibile') && !message.includes('Messaggio non disponibile');
      
      return {
        messageType: type,
        success,
        message,
        error: success ? undefined : 'Returns fallback message'
      };
    } catch (error) {
      return {
        messageType: type,
        success: false,
        error: `Exception: ${error}`
      };
    }
  }

  /**
   * Validate message archive structure
   */
  static validateMessageArchive(): {
    valid: boolean;
    issues: string[];
    statistics: {
      totalTypes: number;
      totalMessages: number;
      averageMessagesPerType: number;
    };
  } {
    const issues: string[] = [];
    let totalMessages = 0;

    // Check each message type in the archive
    Object.entries(MESSAGE_ARCHIVE).forEach(([type, messages]) => {
      if (!messages) {
        issues.push(`MessageType ${type} has no messages`);
        return;
      }

      if (Array.isArray(messages)) {
        if (messages.length === 0) {
          issues.push(`MessageType ${type} has empty message array`);
        } else {
          totalMessages += messages.length;
        }
      } else if (typeof messages === 'object') {
        // Handle biome-based messages
        const biomeCount = Object.keys(messages).length;
        if (biomeCount === 0) {
          issues.push(`MessageType ${type} has empty biome object`);
        } else {
          Object.entries(messages).forEach(([biome, biomeMessages]) => {
            if (!Array.isArray(biomeMessages) || biomeMessages.length === 0) {
              issues.push(`MessageType ${type} biome '${biome}' has no messages`);
            } else {
              totalMessages += biomeMessages.length;
            }
          });
        }
      } else {
        issues.push(`MessageType ${type} has invalid message format`);
      }
    });

    const totalTypes = Object.keys(MESSAGE_ARCHIVE).length;
    const averageMessagesPerType = totalTypes > 0 ? Math.round(totalMessages / totalTypes) : 0;

    return {
      valid: issues.length === 0,
      issues,
      statistics: {
        totalTypes,
        totalMessages,
        averageMessagesPerType
      }
    };
  }
}

// Export test functions for console usage
export const testMessageSystem = MessageSystemTester.runComprehensiveTest;
export const validateMessageArchive = MessageSystemTester.validateMessageArchive;