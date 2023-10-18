<?php
namespace App\Controllers;
class IndexController extends BaseController
{

 public function index()
 {
    return view("index.php");
 }

 public function darkpattern()
 {
   return view("darkpattern.php");
 }

 public function hidden()
 {
   return view("hidden.php");
 }

 public function preselection()
 {
   return view("preselection.php");
 }
 public function popup()
 {
   return view("popup.php");
 }

 public function toyemotion()
 {
   return view("toyemotion.php");
 }

 public function tutorial()
 {
   return view("tutorial.php");
 }

 public function report()
 {
   return view("report.php");
 }
 public function about()
 {
   return view("about.php");
 }
}