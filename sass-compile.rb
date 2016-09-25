#exec 'sass .\core\scss\main.scss .\public\css\main.css'

# Can also run so it auto updates, needs ruby and sass gem installed
exec 'sass --watch .\core\scss\:public/css'
