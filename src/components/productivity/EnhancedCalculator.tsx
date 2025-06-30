
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Delete, RotateCcw } from 'lucide-react';

const EnhancedCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);
      
      const historyEntry = `${currentValue} ${operation} ${inputValue} = ${newValue}`;
      setHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      
      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case '%':
        return firstValue % secondValue;
      case '^':
        return Math.pow(firstValue, secondValue);
      default:
        return secondValue;
    }
  };

  const calculateEqual = () => {
    if (operation && previousValue !== null) {
      performOperation('=');
      setOperation(null);
      setPreviousValue(null);
      setWaitingForOperand(true);
    }
  };

  const buttonClass = "h-12 text-lg font-semibold transition-all hover:scale-105";

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Card className="glass-effect">
        <CardContent className="p-4">
          {/* Display */}
          <div className="bg-black/20 p-4 rounded-lg mb-4">
            <div className="text-right text-3xl font-mono text-white overflow-hidden">
              {display}
            </div>
            {operation && previousValue !== null && (
              <div className="text-right text-sm text-gray-400">
                {previousValue} {operation}
              </div>
            )}
          </div>

          {/* Button Grid */}
          <div className="grid grid-cols-4 gap-2">
            {/* Row 1 */}
            <Button 
              onClick={clear} 
              className={`${buttonClass} bg-red-600 hover:bg-red-700 col-span-2`}
            >
              Clear
            </Button>
            <Button 
              onClick={backspace} 
              className={`${buttonClass} bg-orange-600 hover:bg-orange-700`}
            >
              <Delete className="w-5 h-5" />
            </Button>
            <Button 
              onClick={() => performOperation('÷')} 
              className={`${buttonClass} bg-blue-600 hover:bg-blue-700`}
            >
              ÷
            </Button>

            {/* Row 2 */}
            <Button onClick={() => inputNumber('7')} className={`${buttonClass} bg-gray-700 hover:bg-gray-600`}>7</Button>
            <Button onClick={() => inputNumber('8')} className={`${buttonClass} bg-gray-700 hover:bg-gray-600`}>8</Button>
            <Button onClick={() => inputNumber('9')} className={`${buttonClass} bg-gray-700 hover:bg-gray-600`}>9</Button>
            <Button onClick={() => performOperation('×')} className={`${buttonClass} bg-blue-600 hover:bg-blue-700`}>×</Button>

            {/* Row 3 */}
            <Button onClick={() => inputNumber('4')} className={`${buttonClass} bg-gray-700 hover:bg-gray-600`}>4</Button>
            <Button onClick={() => inputNumber('5')} className={`${buttonClass} bg-gray-700 hover:bg-gray-600`}>5</Button>
            <Button onClick={() => inputNumber('6')} className={`${buttonClass} bg-gray-700 hover:bg-gray-600`}>6</Button>
            <Button onClick={() => performOperation('-')} className={`${buttonClass} bg-blue-600 hover:bg-blue-700`}>-</Button>

            {/* Row 4 */}
            <Button onClick={() => inputNumber('1')} className={`${buttonClass} bg-gray-700 hover:bg-gray-600`}>1</Button>
            <Button onClick={() => inputNumber('2')} className={`${buttonClass} bg-gray-700 hover:bg-gray-600`}>2</Button>
            <Button onClick={() => inputNumber('3')} className={`${buttonClass} bg-gray-700 hover:bg-gray-600`}>3</Button>
            <Button onClick={() => performOperation('+')} className={`${buttonClass} bg-blue-600 hover:bg-blue-700`}>+</Button>

            {/* Row 5 */}
            <Button onClick={() => inputNumber('0')} className={`${buttonClass} bg-gray-700 hover:bg-gray-600 col-span-2`}>0</Button>
            <Button onClick={inputDecimal} className={`${buttonClass} bg-gray-700 hover:bg-gray-600`}>.</Button>
            <Button onClick={calculateEqual} className={`${buttonClass} bg-green-600 hover:bg-green-700`}>=</Button>
          </div>
        </CardContent>
      </Card>

      {/* History Panel */}
      {history.length > 0 && (
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">History</h3>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setHistory([])}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {history.map((entry, index) => (
                <div key={index} className="text-xs font-mono text-gray-300 p-1 bg-black/20 rounded">
                  {entry}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedCalculator;
