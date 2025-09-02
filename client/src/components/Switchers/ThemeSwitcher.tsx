import useColorMode from '../../hooks/useColorMode';

const ThemeSwitcher = () => {
  const [colorMode, setColorMode] = useColorMode();

  return (
    <div>
      <label
        htmlFor="toggle1"
        className="flex cursor-pointer select-none items-center"
      >
        <div className="relative">
          <input
            type="checkbox"
            id="toggle1"
            className="sr-only"
            onChange={() => {
              setColorMode(colorMode === 'light' ? 'dark' : 'light');
            }}
            checked={colorMode === 'dark'}
          />
          <div className="block h-8 w-14 rounded-full bg-meta-9 dark:bg-[#5A616B]"></div>
          <div
            className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${
              colorMode === 'dark' && 'translate-x-full !bg-primary dark:!bg-white'
            }`}
          ></div>
        </div>
      </label>
    </div>
  );
};

export default ThemeSwitcher;
