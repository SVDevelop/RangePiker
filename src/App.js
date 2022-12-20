import { useState, useRef } from "react";
import { DatePicker, Input } from "antd";
import dayjs from "dayjs";
import InputMask from "react-input-mask";

import "./App.sass";

const CUSTOMER_FORMAT = "DD.MM.YY";

const { RangePicker } = DatePicker;

function App() {
  const [open, setOpen] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);

  const [currentDate, setCurrentDate] = useState([
    dayjs(),
    dayjs().add(1, "month")
  ]);

  const [inputValue, setInputValue] = useState([
    currentDate[0].format(CUSTOMER_FORMAT),
    currentDate[1].format(CUSTOMER_FORMAT)
  ]);

  const input0 = useRef();
  const input1 = useRef();

  const onPickerChange = range => {
    console.log(
      "=== ==> onPickerChange ==> range",
      range[0].format(CUSTOMER_FORMAT),
      range[1].format(CUSTOMER_FORMAT)
    );
    setCurrentDate(range);
    if (range[1].format(CUSTOMER_FORMAT) !== inputValue[1]) hidePicker();
    setInputValue([
      range[0].format(CUSTOMER_FORMAT),
      range[1].format(CUSTOMER_FORMAT)
    ]);
  };

  const hidePicker = () => {
    setOpen(false);
    setTimeout(() => {
      setPickerLoading(true);
    }, 100);
    // setPickerLoading(true);
    setTimeout(() => {
      setPickerLoading(false);
    }, 500);
  };

  const beforeMaskedValueChange = (newState, oldState, index) => {
    const { selection, value } = newState;
    let returnedSelection = selection ? { ...selection } : null;
    if (selection && selection.start === 8 && selection.end === 8) {
      // Сюда можно вписать дополнительные условия для дат, которые вводят.
      // Сейчас проверяется только валидность самой даты. Если валидна -
      // записывается в общий стейт, если нет - перетирается датой из стейта.
      if (dayjs(value, CUSTOMER_FORMAT, true).isValid()) {
        if (index && dayjs(value, CUSTOMER_FORMAT).isBefore(currentDate[0])) {
          setInputValue(prev => {
            const newDate = [...prev];
            newDate[index] = dayjs(currentDate[index]).format(CUSTOMER_FORMAT);
            return newDate;
          });
          returnedSelection = { start: 0, end: 0 };
        } else {
          let isAfter = false;
          setCurrentDate(prev => {
            const newDate = [...prev];
            const newValue = dayjs(value, CUSTOMER_FORMAT);
            newDate[index] = newValue;
            if (!index && newValue.isAfter(currentDate[1])) {
              newDate[1] = newValue;
              isAfter = true;
            }
            return newDate;
          });
          if (!index && input1.current) {
            input1.current.setSelectionRange(0, 2);
            input1.current.focus();
            input1.current.setSelectionRange(0, 2);
          } else if (index) {
            hidePicker();
            input1.current.blur();
          }
          returnedSelection = { start: 0, end: 0 };
          setInputValue(prev => {
            const newDate = [...prev];
            newDate[index] = value;
            if (isAfter) newDate[1] = value;
            return newDate;
          });
        }
      } else {
        setInputValue(prev => {
          const newDate = [...prev];
          newDate[index] = dayjs(currentDate[index]).format(CUSTOMER_FORMAT);
          return newDate;
        });
      }
    } else if (selection !== oldState.selection && value !== oldState.value) {
      setInputValue(prev => {
        const newDate = [...prev];
        newDate[index] = value;
        return newDate;
      });
    }
    return { selection: returnedSelection, value };
  };

  const onFocus = e => {
    e.target.setSelectionRange(0, 2);
    if (!open) setOpen(true);
  };

  const onBlur = (e, index) => {
    const {
      target: { value }
    } = e;
    if (dayjs(value, CUSTOMER_FORMAT, true).isValid()) {
      setCurrentDate(prev => {
        const newDate = [...prev];
        newDate[index] = dayjs(value, CUSTOMER_FORMAT);
        return newDate;
      });
    } else {
      setInputValue(prev => {
        const newDate = [...prev];
        newDate[index] = dayjs(currentDate[index]).format(CUSTOMER_FORMAT);
        return newDate;
      });
    }
  };

  const onOpenChange = isOpen => {
    if (!isOpen) hidePicker();
  };

  return (
    <div className="App">
      <div className="picker-block">
        <div className="inputs">
          <InputMask
            mask="99.99.99"
            value={inputValue[0]}
            onFocus={e => onFocus(e, 0)}
            onBlur={e => onBlur(e, 0)}
            beforeMaskedValueChange={(a, b) => beforeMaskedValueChange(a, b, 0)}
          >
            {inputProps => <Input {...inputProps} ref={input0} />}
          </InputMask>
          &nbsp;-&nbsp;
          <InputMask
            mask="99.99.99"
            value={inputValue[1]}
            onFocus={e => onFocus(e, 1)}
            onBlur={e => onBlur(e, 1)}
            beforeMaskedValueChange={(a, b) => beforeMaskedValueChange(a, b, 1)}
          >
            {inputProps => <Input {...inputProps} ref={input1} />}
          </InputMask>
        </div>

        {pickerLoading ? null : (
          <RangePicker
            format={CUSTOMER_FORMAT}
            open={open}
            separator="-"
            suffixIcon
            allowClear={false}
            value={[
              dayjs(currentDate[0], CUSTOMER_FORMAT),
              dayjs(currentDate[1], CUSTOMER_FORMAT)
            ]}
            onChange={onPickerChange}
            inputReadOnly={true}
            onOpenChange={onOpenChange}
          />
        )}
      </div>
    </div>
  );
}

export default App;
