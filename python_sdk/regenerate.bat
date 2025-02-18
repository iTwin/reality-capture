cd D:\dev\reality-capture\python
pip uninstall reality_capture -y
rmdir /s /q D:\dev\reality-capture\python\dist
rmdir /s /q D:\dev\reality-capture\python\docs\_build
py -m build
pip install D:\dev\reality-capture\python\dist\reality_capture-2.0.0-py3-none-any.whl
cd D:\dev\reality-capture\python\docs
.\make.bat html
cd D:\dev\reality-capture\python